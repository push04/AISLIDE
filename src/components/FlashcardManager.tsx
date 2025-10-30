import React, { useReducer, useMemo, useEffect, memo, useState } from 'react';
import { CreditCard, Wand2, Download, Play, RotateCcw, CheckCircle } from 'lucide-react';
import { Upload } from '../services/FileProcessor';
import { OpenRouterAPI } from '../services/OpenRouterAPI';
import { useFlashcards, updateCardWithSM2 } from '../contexts/FlashcardContext';
import { extractJSONFromResponse } from '../services/lessonParser';

// ================================================================================================
// 1. STATE MANAGEMENT
// ================================================================================================

type State = {
  selectedUploadId: string;
  cardCount: number;
  isGenerating: boolean;
  isStudyMode: boolean;
  error: string | null;
};

type Action =
  | { type: 'SET_FIELD'; field: keyof State; payload: any }
  | { type: 'START_GENERATION' }
  | { type: 'GENERATION_COMPLETE'; error?: string };

const initialState: State = {
  selectedUploadId: '',
  cardCount: 10,
  isGenerating: false,
  isStudyMode: false,
  error: null,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.payload, error: null };
    case 'START_GENERATION':
      return { ...state, isGenerating: true, error: null };
    case 'GENERATION_COMPLETE':
      return { ...state, isGenerating: false, error: action.error || null };
    default:
      return state;
  }
};

// ================================================================================================
// 2. UI SUB-COMPONENTS
// ================================================================================================

interface DashboardProps {
  uploads: Upload[];
  state: State;
  dispatch: React.Dispatch<Action>;
  onGenerate: () => void;
  onStartStudy: () => void;
  onExport: () => void;
}

const FlashcardDashboard = memo(({ uploads, state, dispatch, onGenerate, onStartStudy, onExport }: DashboardProps) => {
  const { state: { dueCards, cards } } = useFlashcards();
  const processedUploads = useMemo(() => uploads.filter(u => u.processed), [uploads]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
          <CreditCard className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-slate-800">{cards.length}</h3>
          <p className="text-slate-600">Total Cards</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
          <RotateCcw className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-slate-800">{dueCards.length}</h3>
          <p className="text-slate-600">Due for Review</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
          <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-slate-800">{cards.length - dueCards.length}</h3>
          <p className="text-slate-600">Mastered</p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Document</label>
            <select
              value={state.selectedUploadId}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'selectedUploadId', payload: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              disabled={processedUploads.length === 0}
            >
              <option value="">{processedUploads.length > 0 ? 'Choose a document...' : 'No documents processed'}</option>
              {processedUploads.map((u) => <option key={u.id} value={u.id}>{u.filename}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Number of Cards</label>
            <select value={state.cardCount} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'cardCount', payload: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
              {[5, 10, 15, 20, 25].map(c => <option key={c} value={c}>{c} cards</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <button onClick={onGenerate} disabled={!state.selectedUploadId || state.isGenerating} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            {state.isGenerating ? 'Generating...' : 'Generate Cards'}
          </button>
          <button onClick={onStartStudy} disabled={dueCards.length === 0} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-400 flex items-center gap-2">
            <Play className="w-5 h-5" />
            Study ({dueCards.length} due)
          </button>
          <button onClick={onExport} disabled={!state.selectedUploadId || cards.filter(c => c.uploadId === state.selectedUploadId).length === 0} className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-slate-400 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export for Anki
          </button>
        </div>
      </div>
    </div>
  );
});

const StudySession = memo(({ onReview, onEndSession }: { onReview: (id: string, quality: number) => void; onEndSession: () => void; }) => {
  const { state: { dueCards } } = useFlashcards();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Effect to reset the session if the underlying due cards change. This prevents crashes.
  useEffect(() => {
    setCurrentIndex(0);
    setShowAnswer(false);
  }, [dueCards]);

  const currentCard = dueCards[currentIndex];

  if (!currentCard) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold">Session Complete!</h2>
        <button onClick={onEndSession} className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg">Return to Dashboard</button>
      </div>
    );
  }

  const handleReview = (quality: number) => {
    onReview(currentCard.id, quality);
    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      onEndSession();
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800">Study Session</h1>
        <p className="text-lg text-slate-600">Card {currentIndex + 1} of {dueCards.length}</p>
        <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${((currentIndex + 1) / dueCards.length) * 100}%` }} />
        </div>
      </div>
      <div className="bg-white rounded-xl p-8 shadow-sm border">
        <div className="text-center mb-8 min-h-[100px] flex items-center justify-center">
          <p className="text-xl text-slate-700">{currentCard.question}</p>
        </div>
        {!showAnswer ? (
          <button onClick={() => setShowAnswer(true)} className="w-full px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-lg">
            Show Answer
          </button>
        ) : (
          <div>
            <div className="mb-8 bg-slate-50 rounded-lg p-6 min-h-[100px] flex items-center justify-center">
              <p className="text-lg text-slate-700">{currentCard.answer}</p>
            </div>
            <p className="text-slate-600 mb-4 text-center">How well did you know this?</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button onClick={() => handleReview(1)} className="px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">Again</button>
              <button onClick={() => handleReview(3)} className="px-4 py-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200">Hard</button>
              <button onClick={() => handleReview(4)} className="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">Good</button>
              <button onClick={() => handleReview(5)} className="px-4 py-3 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200">Easy</button>
            </div>
          </div>
        )}
      </div>
      <div className="text-center">
        <button onClick={onEndSession} className="px-4 py-2 text-slate-600 hover:text-slate-800">End Study Session</button>
      </div>
    </div>
  );
});

// ================================================================================================
// 3. MAIN COMPONENT
// ================================================================================================

export const FlashcardManager: React.FC<FlashcardManagerProps> = ({ uploads, apiKey }) => {
  const { state: flashcardState, dispatch: flashcardDispatch } = useFlashcards();
  const [state, dispatch] = useReducer(reducer, initialState);

  const processedUploads = useMemo(() => uploads.filter(u => u.processed && u.status === 'completed'), [uploads]);
  const selectedUpload = useMemo(() => processedUploads.find(u => u.id === state.selectedUploadId), [processedUploads, state.selectedUploadId]);

  useEffect(() => {
    flashcardDispatch({ type: 'UPDATE_DUE_CARDS' });
  }, [flashcardState.cards, flashcardDispatch]);

  const handleGenerate = async () => {
    if (!selectedUpload) {
      dispatch({ type: 'GENERATION_COMPLETE', error: 'Please select a processed document first.' });
      return;
    }
    if (!apiKey) {
      dispatch({ type: 'GENERATION_COMPLETE', error: 'API key is missing. Please add it in Settings.' });
      return;
    }
    if (!selectedUpload.fullText || selectedUpload.fullText.trim() === '') {
      dispatch({ type: 'GENERATION_COMPLETE', error: 'The selected document appears to be empty.' });
      return;
    }

    dispatch({ type: 'START_GENERATION' });
    try {
      const api = new OpenRouterAPI(apiKey);
      const response = await api.generateFlashcards(selectedUpload.fullText, state.cardCount);
      const parsed = extractJSONFromResponse(response);
      
      let flashcardArray: any[] | null = null;
      if (parsed) {
        if (Array.isArray(parsed)) {
          flashcardArray = parsed;
        } else if (typeof parsed === 'object' && parsed !== null) {
          const keyWithArray = Object.keys(parsed).find(k => Array.isArray((parsed as any)[k]));
          if (keyWithArray) {
            flashcardArray = (parsed as any)[keyWithArray];
          }
        }
      }

      if (!flashcardArray) {
        throw new Error('AI response was not a valid JSON array. The model may be experiencing issues. Please try again.');
      }

      const newFlashcards = flashcardArray.map((card: any) => ({
        uploadId: state.selectedUploadId,
        question: card.question || 'No Question Provided',
        answer: card.answer || 'No Answer Provided',
      }));
      
      flashcardDispatch({ type: 'ADD_CARDS', cards: newFlashcards });
      dispatch({ type: 'GENERATION_COMPLETE' });

    } catch (error: any) {
      dispatch({ type: 'GENERATION_COMPLETE', error: error.message });
    }
  };
  
  const handleReviewCard = (cardId: string, quality: number) => {
    const card = flashcardState.cards.find(c => c.id === cardId);
    if (card) {
      const updates = updateCardWithSM2(card, quality);
      flashcardDispatch({ type: 'UPDATE_CARD', cardId, updates });
    }
  };
  
  const handleExport = () => {
    const cardsToExport = flashcardState.cards.filter(c => c.uploadId === state.selectedUploadId);
    if (cardsToExport.length === 0) {
      alert('No flashcards to export for the selected document.');
      return;
    }
    const tsvContent = cardsToExport.map(c => `${c.question}\t${c.answer}`).join('\n');
    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedUpload?.filename.replace(/\.[^/.]+$/, "")}-flashcards.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (state.isStudyMode) {
    return <StudySession 
              onReview={handleReviewCard} 
              onEndSession={() => dispatch({ type: 'SET_FIELD', field: 'isStudyMode', payload: false })} 
           />;
  }

  return (
    <div className="space-y-8">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800">Flashcard Management</h1>
            <p className="text-lg text-slate-600">Generate, study, and manage flashcards with spaced repetition.</p>
        </div>
        {state.error && <div className="text-center text-sm text-rose-600 bg-rose-50 p-3 rounded-lg">{state.error}</div>}
        <FlashcardDashboard
          uploads={processedUploads}
          state={state}
          dispatch={dispatch}
          onGenerate={handleGenerate}
          onStartStudy={() => dispatch({ type: 'SET_FIELD', field: 'isStudyMode', payload: true })}
          onExport={handleExport}
        />
    </div>
  );
};

export default FlashcardManager;

