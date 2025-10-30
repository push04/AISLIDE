import React from 'react';
import { LandingPage } from './LandingPage';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { user, loading } = useAuth();

  // Check if Supabase is configured - REQUIRED for production
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="gradient-mesh fixed inset-0 opacity-20" />
        <div className="relative max-w-md w-full glass-card p-8 rounded-2xl border border-border">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-error to-warning rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Configuration Required</h2>
            <p className="text-muted-foreground mb-6">
              Supabase authentication must be configured to use this application.
            </p>
            <div className="space-y-4 text-sm text-muted-foreground text-left">
              <p>Please ensure the following environment variables are set:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li><code className="text-primary">VITE_SUPABASE_URL</code></li>
                <li><code className="text-primary">VITE_SUPABASE_ANON_KEY</code></li>
              </ul>
              <p className="text-xs pt-4 border-t border-border text-center">
                Contact your system administrator for assistance with configuration.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="gradient-mesh fixed inset-0 opacity-20" />
        <div className="text-center relative z-10">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not logged in
  if (!user) {
    return <LandingPage />;
  }

  // User is logged in, show the app
  return <>{children}</>;
}
