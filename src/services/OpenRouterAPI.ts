// src/services/OpenRouterAPI.ts
import type { Upload } from './FileProcessor';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

type CompletionOpts = {
  expectJson?: boolean;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
  stream?: boolean;
};

/**
 * Single place to manage your preferred models.
 * Order = preference. Availability can change; fallback handles errors.
 */
const MODELS_POOL: readonly string[] = [
  'meta-llama/llama-3.1-8b-instruct:free',
  'qwen/qwen-2.5-32b-instruct:free',
  'google/gemma-2-9b-it:free',
  'mistralai/mistral-7b-instruct:free',
  'deepseek/deepseek-r1:free',
  'openchat/openchat-3.5:free',
  'mistralai/mixtral-8x7b-instruct',
  'meta-llama/llama-3.1-70b-instruct',
  'qwen/qwen-2.5-72b-instruct',
  'nousresearch/hermes-2-pro-mistral',
] as const;

/**
 * Per-feature ordering (can bias toward stronger JSON behavior for quiz/flashcards,
 * and toward bigger-context models for lessons).
 */
const MODEL_ORDER = {
  lesson: [
    // Wider context / stronger generalists first
    MODELS_POOL[0],
    MODELS_POOL[2],
    MODELS_POOL[6],
    MODELS_POOL[3],
    MODELS_POOL[7],
    MODELS_POOL[1],
    MODELS_POOL[8],
    MODELS_POOL[4],
    MODELS_POOL[5],
    MODELS_POOL[9],
  ],
  quiz: [
    // Models that tend to follow JSON instructions well
    MODELS_POOL[0],
    MODELS_POOL[1],
    MODELS_POOL[2],
    MODELS_POOL[3],
    MODELS_POOL[6],
    MODELS_POOL[7],
    MODELS_POOL[5],
    MODELS_POOL[4],
    MODELS_POOL[8],
    MODELS_POOL[9],
  ],
  flashcards: [
    MODELS_POOL[0],
    MODELS_POOL[1],
    MODELS_POOL[2],
    MODELS_POOL[3],
    MODELS_POOL[6],
    MODELS_POOL[7],
    MODELS_POOL[5],
    MODELS_POOL[4],
    MODELS_POOL[8],
    MODELS_POOL[9],
  ],
  chat: [
    // Snappy/free first, then bigger
    MODELS_POOL[0],
    MODELS_POOL[1],
    MODELS_POOL[2],
    MODELS_POOL[3],
    MODELS_POOL[4],
    MODELS_POOL[5],
    MODELS_POOL[6],
    MODELS_POOL[7],
    MODELS_POOL[8],
    MODELS_POOL[9],
  ],
} as const;

export class OpenRouterAPI {
  constructor(private apiKey: string) {
    if (!apiKey || apiKey.trim() === '' || apiKey === 'placeholder-key') {
      throw new Error('OpenRouter API key is required. Please configure your API key in Settings.');
    }
  }

  // ---------------------------------------------------------------------------
  // Core helpers
  // ---------------------------------------------------------------------------

  private get headers() {
    if (!this.apiKey) throw new Error('OpenRouter API key not configured');
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://slidetutor.netlify.app',
      'X-Title': 'SlideTutor AI',
    };
  }

  private async rawCompletionRequest(
    model: string,
    messages: ChatMessage[],
    {
      expectJson,
      temperature = 0.3,
      maxTokens = 4096,
      signal,
      stream,
    }: CompletionOpts = {}
  ) {
    const body: Record<string, any> = {
      model,
      messages,
      temperature,
      top_p: 0.9,
      max_tokens: maxTokens,
    };

    if (expectJson) {
      body.response_format = { type: 'json_object' };
      if (stream) delete body.stream; // avoid partial JSON streams
    } else if (stream) {
      body.stream = true;
    }

    const res = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
      signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      const hint =
        res.status === 429
          ? 'Rate limited. Retry soon or try another model.'
          : res.status >= 500
          ? 'Provider error. Retry or switch model.'
          : 'Verify request format and API key/limits.';
      throw new Error(
        `OpenRouter ${res.status} ${res.statusText} [${model}] — ${hint}\n${errText}`
      );
    }

    if (stream) return res;

    const data = await res.json();
    const content =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.delta?.content ??
      '';
    const finish = data?.choices?.[0]?.finish_reason ?? '';
    return { content, finish, raw: data };
  }

  private async completionWithFallback(
    models: readonly string[],
    messages: ChatMessage[],
    options: CompletionOpts = {}
  ): Promise<{ content: string; finish: string; model: string; raw: any } | Response> {
    let lastError: unknown;

    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      let attempt = 0;
      const maxAttempts = 3;

      while (attempt < maxAttempts) {
        try {
          const result = await this.rawCompletionRequest(model, messages, options);
          if (result instanceof Response) return result;
          return { ...(result as any), model };
        } catch (err: any) {
          lastError = err;
          const transient =
            typeof err?.message === 'string' &&
            (/\b429\b/.test(err.message) || /\b5\d{2}\b/.test(err.message));
          attempt++;
          if (attempt >= maxAttempts || !transient) break;
          await new Promise((r) => setTimeout(r, 400 * attempt)); // 400ms, 800ms
        }
      }
      // proceed to next model
    }
    throw lastError ?? new Error('All model attempts failed');
  }

  // ---------------------------------------------------------------------------
  // Feature wrappers
  // ---------------------------------------------------------------------------

  async generateLesson(uploadOrContent: Upload | string): Promise<string> {
    const content =
      typeof uploadOrContent === 'string'
        ? uploadOrContent
        : String(uploadOrContent.fullText ?? '');

    const systemPrompt =
      `You are an experienced teacher and curriculum designer. Create a comprehensive multi-level lesson from the provided content.\n\n` +
      `Structure your response with:\n` +
      `1) A clear title\n` +
      `2) Three difficulty levels (Beginner, Intermediate, Advanced)\n` +
      `3) Each level includes: explanation, worked example, and practical tips\n` +
      `4) A short quiz with 5 questions\n\n` +
      `Be educational, engaging, and use clear headings.`;
    const userPrompt = `Create a lesson from this content:\n\n${content}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const result = await this.completionWithFallback(MODEL_ORDER.lesson, messages, {
      maxTokens: 4096,
      temperature: 0.3,
    });

    if (result instanceof Response) throw new Error('Unexpected stream for generateLesson');
    if (result.finish === 'length') {
      console.warn(`[generateLesson] Output truncated on model ${result.model}`);
    }
    return result.content;
  }

  async generateQuiz(content: string, questionCount: number = 5): Promise<string> {
    const systemPrompt =
      `You are an expert quiz creator. Generate multiple-choice questions from the provided content.\n\n` +
      `Return ONLY a valid JSON object with one key "quiz", an array of question objects.\n` +
      `Schema for each question:\n` +
      `{\n  "question": "question text",\n  "options": ["option A", "option B", "option C", "option D"],\n  "correctIndex": 0,\n  "explanation": "why this answer is correct"\n}\n` +
      `No markdown, no code fences, no extra text.`;
    const userPrompt = `Create exactly ${questionCount} multiple-choice questions from this content:\n\n${content}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const result = await this.completionWithFallback(MODEL_ORDER.quiz, messages, {
      maxTokens: 4096,
      temperature: 0.1,
      expectJson: true,
    });

    if (result instanceof Response) throw new Error('Unexpected stream for generateQuiz');
    return result.content;
  }

  async generateFlashcards(content: string, cardCount: number = 10): Promise<string> {
    const systemPrompt =
      `You are an expert at creating educational flashcards. From the provided content, create clear, concise Q&A pairs.\n\n` +
      `Return ONLY a valid JSON object with one key "flashcards", an array of cards.\n` +
      `Each card has "question" and "answer" keys.\n` +
      `No markdown, no code fences, no extra text.`;
    const userPrompt = `Create exactly ${cardCount} flashcards from this content:\n\n${content}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const result = await this.completionWithFallback(MODEL_ORDER.flashcards, messages, {
      maxTokens: 4096,
      temperature: 0.1,
      expectJson: true,
    });

    if (result instanceof Response) throw new Error('Unexpected stream for generateFlashcards');
    return result.content;
  }

  async answerQuestion(question: string, context: string): Promise<string> {
    const systemPrompt =
      `You are a helpful AI assistant. Answer the user's question using only the provided context.\n` +
      `If the answer is not in the context, say: "I don’t see that in the provided documents."`;
    const userPrompt = `Context:\n${context}\n\nQuestion: ${question}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const result = await this.completionWithFallback(MODEL_ORDER.chat, messages, {
      maxTokens: 2048,
      temperature: 0.2,
    });

    if (result instanceof Response) throw new Error('Unexpected stream for answerQuestion');
    return result.content;
  }

  /** Optional streaming variant for chat/Q&A */
  async answerQuestionStream(
    question: string,
    context: string,
    opts: { signal?: AbortSignal } = {}
  ): Promise<Response> {
    const systemPrompt =
      `You are a helpful AI assistant. Answer the user's question using only the provided context.\n` +
      `If the answer is not in the context, say: "I don’t see that in the provided documents."`;
    const userPrompt = `Context:\n${context}\n\nQuestion: ${question}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    let lastError: unknown;
    for (const model of MODEL_ORDER.chat) {
      try {
        const res = await this.rawCompletionRequest(model, messages, {
          temperature: 0.2,
          maxTokens: 2048,
          stream: true,
          signal: opts.signal,
        });
        if (!(res instanceof Response)) throw new Error('Expected streaming Response');
        return res;
      } catch (err) {
        lastError = err;
        // try next model
      }
    }
    throw lastError ?? new Error('All streaming model attempts failed');
  }
}
