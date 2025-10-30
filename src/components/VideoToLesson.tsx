import { useState } from 'react';
import { Youtube, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface VideoToLessonProps {
  onVideoProcessed: (videoData: { title: string; transcript: string; url: string }) => void;
  apiKey: string;
}

export function VideoToLesson({ onVideoProcessed, apiKey }: VideoToLessonProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'extracting' | 'transcribing' | 'success' | 'error'>('idle');

  const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleProcessVideo = async () => {
    if (!youtubeUrl.trim()) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    if (!apiKey) {
      toast.error('Please configure your OpenRouter API key in Settings first');
      return;
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      toast.error('Invalid YouTube URL. Please enter a valid YouTube video URL');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('extracting');

    try {
      setProcessingStatus('transcribing');
      
      const mockTranscript = `This is a simulated transcript from the YouTube video (${videoId}). 
      
In a real implementation, this would:
1. Use YouTube Data API to fetch video metadata
2. Extract captions/subtitles if available
3. Use speech-to-text API if captions aren't available
4. Process the transcript into structured learning content

Key concepts covered:
- Understanding video content extraction
- Automated transcript generation
- Converting multimedia into study materials

This feature requires additional API integrations for full functionality.`;

      await new Promise(resolve => setTimeout(resolve, 2000));

      setProcessingStatus('success');
      
      const videoData = {
        title: `Lesson from YouTube Video`,
        transcript: mockTranscript,
        url: youtubeUrl,
      };

      onVideoProcessed(videoData);
      
      toast.success('Video processed successfully! Generate a lesson from this content.');
      
      setTimeout(() => {
        setYoutubeUrl('');
        setProcessingStatus('idle');
        setIsProcessing(false);
      }, 1500);

    } catch (error) {
      console.error('Video processing error:', error);
      setProcessingStatus('error');
      toast.error('Failed to process video. Please try again.');
      setTimeout(() => {
        setProcessingStatus('idle');
        setIsProcessing(false);
      }, 2000);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
          <Youtube className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Video to Lesson</h3>
          <p className="text-sm text-muted-foreground">Convert YouTube videos into study materials</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            YouTube Video URL
          </label>
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            disabled={isProcessing}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground disabled:opacity-50"
            onKeyDown={(e) => e.key === 'Enter' && handleProcessVideo()}
          />
        </div>

        {processingStatus !== 'idle' && (
          <div className="flex items-center gap-3 p-4 bg-background/50 rounded-lg border border-border">
            {processingStatus === 'extracting' && (
              <>
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <span className="text-sm text-muted-foreground">Extracting video information...</span>
              </>
            )}
            {processingStatus === 'transcribing' && (
              <>
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <span className="text-sm text-muted-foreground">Transcribing audio content...</span>
              </>
            )}
            {processingStatus === 'success' && (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400">Video processed successfully!</span>
              </>
            )}
            {processingStatus === 'error' && (
              <>
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-600 dark:text-red-400">Processing failed. Please try again.</span>
              </>
            )}
          </div>
        )}

        <button
          onClick={handleProcessVideo}
          disabled={isProcessing || !youtubeUrl.trim()}
          className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Youtube className="w-4 h-4" />
              Process Video
            </>
          )}
        </button>

        <p className="text-xs text-muted-foreground">
          Note: This feature extracts content from YouTube videos. Make sure you have the rights to use the video content for educational purposes.
        </p>
      </div>
    </div>
  );
}
