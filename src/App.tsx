import { useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { EnhancedNavigation } from './components/enhanced/EnhancedNavigation';
import { EnhancedDashboard } from './components/enhanced/EnhancedDashboard';
import { AnalyticsDashboard } from './components/enhanced/AnalyticsDashboard';
import { CommandPalette, useCommandPalette } from './components/enhanced/CommandPalette';
import { AuthGate } from './components/auth/AuthGate';
import { ProfilePage } from './components/auth/ProfilePage';
import { UploadManager } from './components/UploadManager';
import { LessonGenerator } from './components/LessonGenerator';
import { QuizManager } from './components/QuizManager';
import { FlashcardManager } from './components/FlashcardManager';
import { ChatInterface } from './components/ChatInterface';
import { Settings } from './components/Settings';
import { processor, Upload } from './services/FileProcessor';
import { FlashcardProvider } from './contexts/FlashcardContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { usePersistentState } from './hooks/usePersistentState';

export type TabType = 'dashboard' | 'upload' | 'lessons' | 'quiz' | 'flashcards' | 'chat' | 'settings' | 'analytics' | 'profile';

/**
 * The main application component.
 * Manages global state, navigation, and renders the active view.
 */
function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const { isOpen: isPaletteOpen, close: closePalette } = useCommandPalette();
  
  // Use the custom hook for robust, persistent state
  const [uploads, setUploads] = usePersistentState<Upload[]>('slidetutor_uploads', []);
  const [apiKey, setApiKey] = usePersistentState<string>('slidetutor_api_key', '');

  const handleAddUpload = useCallback(async (file: File): Promise<Upload> => {
    const newUpload = await processor.processFile(file);
    setUploads(prev => [...prev, newUpload]);
    return newUpload;
  }, [setUploads]);


  const handleDeleteUpload = useCallback((id: string) => {
    setUploads(prev => prev.filter(u => u.id !== id));
  }, [setUploads]);

  // A map of tab keys to their corresponding components for cleaner rendering
  const viewMap: Record<TabType, React.ReactNode> = {
    dashboard: <EnhancedDashboard uploads={uploads} onNavigate={setActiveTab} />,
    analytics: <AnalyticsDashboard />,
    profile: <ProfilePage />,
    upload: (
      <UploadManager
        uploads={uploads}
        onAddUpload={handleAddUpload}
        onDeleteUpload={handleDeleteUpload}
      />
    ),
    lessons: <LessonGenerator uploads={uploads} apiKey={apiKey} />,
    quiz: <QuizManager uploads={uploads} apiKey={apiKey} />,
    flashcards: <FlashcardManager uploads={uploads} apiKey={apiKey} />,
    chat: <ChatInterface uploads={uploads} apiKey={apiKey} />,
    settings: <Settings apiKey={apiKey} onApiKeyChange={setApiKey} uploads={uploads} />,
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="gradient-mesh fixed inset-0 opacity-20 pointer-events-none" />
      <div className="relative z-10">
        <EnhancedNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {viewMap[activeTab] || <EnhancedDashboard uploads={uploads} onNavigate={setActiveTab} />}
        </main>
      </div>
      
      {/* Command Palette */}
      <CommandPalette 
        isOpen={isPaletteOpen}
        onClose={closePalette}
        onNavigate={setActiveTab}
      />
      
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgb(var(--color-card))',
            color: 'rgb(var(--color-card-foreground))',
            border: '1px solid rgb(var(--color-border))',
            borderRadius: 'var(--radius)',
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FlashcardProvider>
          <AuthGate>
            <AppContent />
          </AuthGate>
        </FlashcardProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
