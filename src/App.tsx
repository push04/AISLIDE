import { useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
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
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { MobileBottomNav } from './components/MobileBottomNav';
import { KeyboardShortcutsGuide } from './components/KeyboardShortcutsGuide';
import { useUploads, useCreateUpload, useDeleteUpload, useUserProfile } from './hooks/useSupabaseQuery';
import { SocraticTutor } from './components/SocraticTutor';
import { DailyChallenges } from './components/DailyChallenges';
import { Leaderboard } from './components/Leaderboard';
import { StudyTimer } from './components/StudyTimer';
import { AdaptiveLearning } from './components/AdaptiveLearning';
import { VideoToLesson } from './components/VideoToLesson';
import { ImageRecognition } from './components/ImageRecognition';

export type TabType = 'dashboard' | 'upload' | 'lessons' | 'quiz' | 'flashcards' | 'chat' | 'settings' | 'analytics' | 'profile' | 'ai-tutor' | 'challenges' | 'leaderboard' | 'study-timer';

/**
 * The main application component.
 * Manages global state, navigation, and renders the active view.
 */
function AppContent() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const { isOpen: isPaletteOpen, close: closePalette } = useCommandPalette();
  
  // Use Supabase hooks for persistent storage
  const { 
    data: uploadsData, 
    isLoading: uploadsLoading, 
    error: uploadsError,
    refetch: refetchUploads 
  } = useUploads();
  const createUploadMutation = useCreateUpload();
  const deleteUploadMutation = useDeleteUpload();
  const { 
    data: userProfile, 
    isLoading: profileLoading, 
    error: profileError,
    refetch: refetchProfile 
  } = useUserProfile();
  
  const uploads = uploadsData || [];
  const apiKey = (userProfile as any)?.openrouter_api_key_encrypted || '';
  
  // Check for errors first (React Query can have isLoading && error simultaneously)
  const hasError = (uploadsError && !uploadsLoading) || (profileError && !profileLoading);
  
  if (hasError) {
    const errorMessage = uploadsError 
      ? 'Failed to load your uploads'
      : 'Failed to load your profile';
    
    const handleRetry = async () => {
      if (uploadsError) {
        await refetchUploads();
      }
      if (profileError) {
        await refetchProfile();
      }
    };
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <p className="text-red-600 font-medium mb-2">{errorMessage}</p>
          <p className="text-gray-600 text-sm mb-4">
            {profileError 
              ? 'Your API key and settings could not be loaded. Some features may not work correctly.'
              : 'Your uploaded files could not be loaded.'}
          </p>
          <button
            onClick={handleRetry}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  // Show loading state while initial data loads (after error check)
  if (uploadsLoading || profileLoading) {
    return <LoadingSpinner fullScreen text="Loading your data..." />;
  }

  const handleAddUpload = useCallback(async (file: File): Promise<Upload> => {
    const newUpload = await processor.processFile(file);
    
    await createUploadMutation.mutateAsync({
      filename: newUpload.filename,
      original_filename: file.name,
      file_size: newUpload.size,
      mime_type: file.type,
      storage_path: `uploads/${newUpload.id}/${file.name}`,
      full_text: newUpload.fullText,
      slide_count: newUpload.slideCount,
      status: newUpload.status,
      processed: newUpload.processed,
      indexed: newUpload.indexed,
      metadata: {},
      error_message: newUpload.errorMessage || null,
      version: 1,
      parent_upload_id: null,
    });
    
    return newUpload;
  }, [createUploadMutation]);


  const handleDeleteUpload = useCallback((id: string) => {
    deleteUploadMutation.mutate(id);
  }, [deleteUploadMutation]);

  // A map of tab keys to their corresponding components for cleaner rendering
  const viewMap: Record<TabType, React.ReactNode> = {
    dashboard: <EnhancedDashboard uploads={uploads} onNavigate={setActiveTab} />,
    analytics: (
      <div className="space-y-6">
        <AnalyticsDashboard />
        <AdaptiveLearning 
          userPerformance={{
            correctAnswers: 45,
            totalAnswers: 60,
            avgResponseTime: 12,
            topicsStruggling: ['Advanced Calculus', 'Organic Chemistry']
          }}
        />
      </div>
    ),
    profile: <ProfilePage />,
    upload: (
      <div className="space-y-6">
        <UploadManager
          uploads={uploads}
          onAddUpload={handleAddUpload}
          onDeleteUpload={handleDeleteUpload}
        />
        <div className="grid md:grid-cols-2 gap-6">
          <VideoToLesson 
            onVideoProcessed={(data) => console.log('Video processed:', data)}
            apiKey={apiKey}
          />
          <ImageRecognition
            onImageProcessed={(data) => console.log('Image processed:', data)}
            apiKey={apiKey}
          />
        </div>
      </div>
    ),
    lessons: <LessonGenerator uploads={uploads} apiKey={apiKey} />,
    quiz: <QuizManager uploads={uploads} apiKey={apiKey} />,
    flashcards: <FlashcardManager uploads={uploads} apiKey={apiKey} />,
    chat: <ChatInterface uploads={uploads} apiKey={apiKey} />,
    'ai-tutor': <SocraticTutor apiKey={apiKey} />,
    challenges: (
      <DailyChallenges 
        userLevel={15}
        onChallengeComplete={(challenge) => console.log('Challenge completed:', challenge)}
      />
    ),
    leaderboard: <Leaderboard currentUserId="current-user" currentUserXP={2500} />,
    'study-timer': (
      <StudyTimer
        onSessionComplete={(duration, type) => console.log(`${type} session completed: ${duration}s`)}
      />
    ),
    settings: <Settings uploads={uploads} />,
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="gradient-mesh fixed inset-0 opacity-20 pointer-events-none" />
      <div className="relative z-10">
        <EnhancedNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="container mx-auto px-4 py-8 max-w-7xl pb-20 md:pb-8">
          {viewMap[activeTab] || <EnhancedDashboard uploads={uploads} onNavigate={setActiveTab} />}
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Keyboard Shortcuts Guide */}
      <KeyboardShortcutsGuide onNavigate={(tab) => setActiveTab(tab as TabType)} />
      
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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ErrorBoundary>
            <AuthProvider>
              <ErrorBoundary>
                <FlashcardProvider>
                  <ErrorBoundary>
                    <AuthGate>
                      <AppContent />
                    </AuthGate>
                  </ErrorBoundary>
                </FlashcardProvider>
              </ErrorBoundary>
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
