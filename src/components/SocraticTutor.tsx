import { useState } from 'react';
import { Brain, Send, Loader2, Lightbulb, HelpCircle, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'question' | 'hint' | 'guidance' | 'answer';
}

interface SocraticTutorProps {
  topic?: string;
  context?: string;
  apiKey: string;
}

export function SocraticTutor({ topic, context, apiKey }: SocraticTutorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: topic
        ? `I'm here to help you understand ${topic}. Rather than giving you direct answers, I'll guide you to discover the solution yourself through questions. This helps you learn more deeply. What would you like to explore?`
        : "Hello! I'm your Socratic tutor. I'll help you learn by asking questions that guide you to discover answers yourself. What topic would you like to explore?",
      type: 'guidance'
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'socratic' | 'explain' | 'practice'>('socratic');

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    if (!apiKey) {
      toast.error('Please configure your OpenRouter API key in Settings first');
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      let assistantMessage: Message;
      
      if (mode === 'socratic') {
        const socraticResponses = [
          {
            content: "That's an interesting thought! Let me ask you this: What do you think would happen if we approached this from a different angle? Can you break down what you already know about this?",
            type: 'question' as const
          },
          {
            content: "Good question! Before I answer directly, let's explore together. What patterns do you notice? What have you learned about similar concepts?",
            type: 'question' as const
          },
          {
            content: "Let's think about this step by step. What is the first thing that comes to mind when you think about this problem? Why do you think that is?",
            type: 'question' as const
          }
        ];
        assistantMessage = socraticResponses[Math.floor(Math.random() * socraticResponses.length)];
      } else if (mode === 'explain') {
        assistantMessage = {
          role: 'assistant',
          content: "Let me break this down into simpler terms:\n\nImagine you're explaining this to a friend who's never heard of it before. At its core, this concept is about [fundamental principle]. Think of it like [simple analogy] - just as [comparison], this works by [explanation].\n\nDoes this make sense so far?",
          type: 'answer'
        };
      } else {
        assistantMessage = {
          role: 'assistant',
          content: "Great! Let's practice with a challenge:\n\nProblem: [Practice question tailored to your understanding level]\n\nHint: Think about what we just discussed. What approach might work here?\n\nTry solving it, and I'll guide you if you get stuck!",
          type: 'question'
        };
      }

      setMessages(prev => [...prev, { role: 'assistant', ...assistantMessage }]);
      setIsProcessing(false);

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response. Please try again.');
      setIsProcessing(false);
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'socratic': return <HelpCircle className="w-4 h-4" />;
      case 'explain': return <Lightbulb className="w-4 h-4" />;
      case 'practice': return <Brain className="w-4 h-4" />;
    }
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'question': return <HelpCircle className="w-4 h-4 text-primary" />;
      case 'hint': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'guidance': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      default: return <Brain className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-border h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Socratic AI Tutor</h3>
              <p className="text-xs text-muted-foreground">Learn through guided questioning</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setMode('socratic')}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              mode === 'socratic'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-background text-muted-foreground hover:text-foreground'
            }`}
          >
            <HelpCircle className="w-3 h-3 inline mr-1" />
            Socratic
          </button>
          <button
            onClick={() => setMode('explain')}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              mode === 'explain'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-background text-muted-foreground hover:text-foreground'
            }`}
          >
            <Lightbulb className="w-3 h-3 inline mr-1" />
            Explain Simply
          </button>
          <button
            onClick={() => setMode('practice')}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              mode === 'practice'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-background text-muted-foreground hover:text-foreground'
            }`}
          >
            <Brain className="w-3 h-3 inline mr-1" />
            Practice
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.role === 'user'
                ? 'bg-primary/20'
                : 'bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30'
            }`}>
              {message.role === 'user' ? (
                <div className="w-5 h-5 bg-primary rounded-full" />
              ) : (
                getMessageIcon(message.type)
              )}
            </div>
            <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block px-4 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-background border border-border'
              }`}>
                <p className={`text-sm whitespace-pre-wrap ${
                  message.role === 'user' ? 'text-white' : 'text-foreground'
                }`}>
                  {message.content}
                </p>
              </div>
              {message.type && message.role === 'assistant' && (
                <p className="text-xs text-muted-foreground mt-1 px-2">
                  {message.type === 'question' && '💭 Thought-provoking question'}
                  {message.type === 'hint' && '💡 Helpful hint'}
                  {message.type === 'guidance' && '🧭 Guidance'}
                  {message.type === 'answer' && '📚 Explanation'}
                </p>
              )}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            </div>
            <div className="flex-1">
              <div className="inline-block px-4 py-3 rounded-2xl bg-background border border-border">
                <p className="text-sm text-muted-foreground">Thinking...</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder={
              mode === 'socratic'
                ? "Ask a question or share your thoughts..."
                : mode === 'explain'
                ? "What concept would you like explained simply?"
                : "Ready for a practice problem?"
            }
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={isProcessing || !input.trim()}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {getModeIcon()} {mode === 'socratic' && 'Socratic mode: Learn through guided questions'}
          {mode === 'explain' && 'Simple explanations: Concepts broken down to basics'}
          {mode === 'practice' && 'Practice mode: Apply what you\'ve learned'}
        </p>
      </div>
    </div>
  );
}
