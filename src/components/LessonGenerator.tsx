import React, { useEffect, useMemo, useReducer, memo } from 'react';
import { BookOpen, Wand2, Download, Copy, RefreshCw } from 'lucide-react';
import type { Upload } from '../services/FileProcessor';
import { OpenRouterAPI } from '../services/OpenRouterAPI';
import { simpleMarkdownToHtml, extractJSONFromResponse } from '../services/lessonParser';

// ================================================================================================
// 1. CONFIGURATION & TYPES
// ================================================================================================

const LESSON_CONFIG = {
  wordsPerMinute: 200,
};

interface LessonGeneratorProps {
  uploads: Upload[];
  apiKey: string;
}

interface ParsedLesson {
  title?: string;
  levels?: Record<'Beginner' | 'Intermediate' | 'Advanced', {
    explanation?: string;
    worked_example?: string;
    tips?: string[];
  }>;
  short_quiz?: Array<{ question: string; answer: string }>;
}

// ================================================================================================
// 2. STATE MANAGEMENT (useReducer)
// ================================================================================================

type State = {
  selectedUploadId: string;
  isGenerating: boolean;
  lessonContent: string;
  parsedLesson: ParsedLesson | null;
  error: string | null;
  showMarkdown: boolean;
  showStructured: boolean;
};

type Action =
  | { type: 'SET_SELECTED_UPLOAD'; payload: string }
  | { type: 'START_GENERATION' }
  | { type: 'GENERATION_SUCCESS'; payload: { raw: string; parsed: ParsedLesson | null } }
  | { type: 'GENERATION_FAILURE'; payload: string }
  | { type: 'TOGGLE_VIEW'; payload: 'markdown' | 'structured' }
  | { type: 'CLEAR' };

const initialState: State = {
  selectedUploadId: '',
  isGenerating: false,
  lessonContent: '',
  parsedLesson: null,
  error: null,
  showMarkdown: true,
  showStructured: true,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_SELECTED_UPLOAD':
      return { ...state, selectedUploadId: action.payload };
    case 'START_GENERATION':
      return { ...state, isGenerating: true, error: null, lessonContent: '', parsedLesson: null };
    case 'GENERATION_SUCCESS':
      return { ...state, isGenerating: false, lessonContent: action.payload.raw, parsedLesson: action.payload.parsed };
    case 'GENERATION_FAILURE':
      return { ...state, isGenerating: false, error: action.payload };
    case 'TOGGLE_VIEW':
      if (action.payload === 'markdown') return { ...state, showMarkdown: !state.showMarkdown };
      if (action.payload === 'structured') return { ...state, showStructured: !state.showStructured };
      return state;
    case 'CLEAR':
      return { ...state, lessonContent: '', parsedLesson: null, error: null };
    default:
      return state;
  }
};

// ================================================================================================
// 3. UI SUB-COMPONENTS
// ================================================================================================

const LessonControls = memo(({ uploads, selectedId, isGenerating, apiKey, onGenerate, onSelect }: any) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
      <div>
        <label htmlFor="select-doc" className="block text-sm font-medium text-slate-700 mb-2">Select Document</label>
        <select id="select-doc" value={selectedId} onChange={e => onSelect(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200">
          <option value="">Choose a document...</option>
          {uploads.map((u: Upload) => <option key={u.id} value={u.id}>{u.filename}</option>)}
        </select>
      </div>
      <div className="flex justify-start md:justify-end items-center gap-4">
        <button onClick={onGenerate} disabled={!selectedId || isGenerating || !apiKey} className="btn px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          {isGenerating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Wand2 className="w-4 h-4" />}
          <span>{isGenerating ? 'Generating...' : 'Generate Lesson'}</span>
        </button>
      </div>
    </div>
  </div>
));

const LessonView = memo(({ content, onCopy, onClear }: any) => {
    const wordCount = useMemo(() => content.trim().split(/\s+/).length, [content]);
    const readingTime = Math.max(1, Math.round(wordCount / LESSON_CONFIG.wordsPerMinute));

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Lesson Text</h2>
                    <p className="text-xs text-slate-500">~{readingTime} min read • {wordCount} words</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={onCopy} title="Copy to Clipboard" className="p-2 hover:bg-slate-100 rounded-md"><Copy className="w-4 h-4" /></button>
                    <button onClick={onClear} title="Clear Lesson" className="p-2 hover:bg-slate-100 rounded-md"><RefreshCw className="w-4 h-4" /></button>
                </div>
            </div>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(content) }} />
        </div>
    );
});

const StructuredLessonView = memo(({ lesson }: { lesson: ParsedLesson }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">{lesson.title ?? 'Structured Lesson'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {lesson.levels && Object.entries(lesson.levels).map(([level, data]) => (
                <article key={level} className="border rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-slate-800 mb-3">{level}</h4>
                    {data.explanation && <div><strong>Explanation:</strong> <p className="text-sm mt-1">{data.explanation}</p></div>}
                    {data.worked_example && <div className="mt-2"><strong>Example:</strong> <p className="text-sm mt-1">{data.worked_example}</p></div>}
                    {data.tips?.length && <div className="mt-2"><strong>Tips:</strong><ul className="list-disc list-inside mt-1 text-sm">{(data.tips || []).map((tip, i) => <li key={i}>{tip}</li>)}</ul></div>}
                </article>
            ))}
        </div>
        {lesson.short_quiz?.length && (
            <section className="mt-6 border-t pt-4">
                <h4 className="text-lg font-semibold mb-3">Quick Quiz</h4>
                <div className="space-y-3">
                    {lesson.short_quiz.map((q, i) => (
                        <details key={i} className="bg-slate-50 p-3 rounded">
                            <summary className="cursor-pointer font-medium">Q{i + 1}: {q.question}</summary>
                            <p className="mt-2 text-slate-700">{q.answer}</p>
                        </details>
                    ))}
                </div>
            </section>
        )}
    </div>
));

// ================================================================================================
// 4. MAIN COMPONENT
// ================================================================================================

export const LessonGenerator: React.FC<LessonGeneratorProps> = ({ uploads, apiKey }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const processedUploads = useMemo(() => uploads.filter(u => u.processed), [uploads]);
  const selectedUpload = useMemo(() => processedUploads.find(u => u.id === state.selectedUploadId), [processedUploads, state.selectedUploadId]);

  useEffect(() => {
    if (!state.selectedUploadId && processedUploads.length > 0) {
      dispatch({ type: 'SET_SELECTED_UPLOAD', payload: processedUploads[0].id });
    }
  }, [processedUploads, state.selectedUploadId]);

  const handleGenerate = async () => {
    if (!selectedUpload) {
        dispatch({ type: 'GENERATION_FAILURE', payload: 'Please select a processed document.' });
        return;
    }
    if (!apiKey) {
        dispatch({ type: 'GENERATION_FAILURE', payload: 'API key is missing. Please set it in settings.' });
        return;
    }

    dispatch({ type: 'START_GENERATION' });
    try {
      const api = new OpenRouterAPI(apiKey);
      // Assumes your OpenRouterAPI class is updated to take the upload object
      const rawContent = await api.generateLesson(selectedUpload); 
      const parsedContent = extractJSONFromResponse(rawContent);
      dispatch({ type: 'GENERATION_SUCCESS', payload: { raw: rawContent, parsed: parsedContent as ParsedLesson } });
    } catch (err: any) {
      dispatch({ type: 'GENERATION_FAILURE', payload: err.message || 'An unknown error occurred.' });
    }
  };

  const handleCopyToClipboard = () => navigator.clipboard.writeText(state.lessonContent);

  return (
    <div className="space-y-6">
        <div className="text-center">
            <h1 className="text-3xl font-extrabold text-slate-900">Generate AI-Powered Lessons</h1>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto">Select a processed document and the AI will generate a lesson based on its content.</p>
        </div>

        <LessonControls
            uploads={processedUploads}
            selectedId={state.selectedUploadId}
            isGenerating={state.isGenerating}
            apiKey={apiKey}
            onGenerate={handleGenerate}
            onSelect={(id: string) => dispatch({ type: 'SET_SELECTED_UPLOAD', payload: id })}
        />

        {state.error && <div className="text-center text-sm text-rose-600 bg-rose-50 p-3 rounded-lg">{state.error}</div>}

        {state.showMarkdown && state.lessonContent && <LessonView content={state.lessonContent} onCopy={handleCopyToClipboard} onClear={() => dispatch({ type: 'CLEAR' })} />}

        {state.showStructured && state.parsedLesson && <StructuredLessonView lesson={state.parsedLesson} />}

        {processedUploads.length === 0 && (
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border">
                <BookOpen className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <h3 className="font-semibold text-slate-800">No Documents Available</h3>
                <p className="text-sm text-slate-600">Please upload and process a document first.</p>
            </div>
        )}
    </div>
  );
};

export default LessonGenerator;
