import React from 'react';
import { 
  LayoutDashboard, Upload, BookOpen, Brain, Layers, 
  MessageSquare, Settings, Sparkles, TrendingUp, Command
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { GlobalSearch } from '../GlobalSearch';
import type { TabType } from '../../App';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, gradient: 'from-blue-500 to-cyan-500' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, gradient: 'from-emerald-500 to-teal-500' },
  { id: 'upload', label: 'Upload', icon: Upload, gradient: 'from-purple-500 to-pink-500' },
  { id: 'lessons', label: 'Lessons', icon: BookOpen, gradient: 'from-green-500 to-emerald-500' },
  { id: 'quiz', label: 'Quizzes', icon: Brain, gradient: 'from-orange-500 to-red-500' },
  { id: 'flashcards', label: 'Flashcards', icon: Layers, gradient: 'from-indigo-500 to-purple-500' },
  { id: 'chat', label: 'Chat Q&A', icon: MessageSquare, gradient: 'from-pink-500 to-rose-500' },
  { id: 'settings', label: 'Settings', icon: Settings, gradient: 'from-slate-500 to-gray-500' },
];

interface EnhancedNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function EnhancedNavigation({ activeTab, onTabChange }: EnhancedNavigationProps) {
  const { user } = useAuth();

  return (
    <nav className="glass-card sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                SlideTutor AI
              </h1>
              <p className="text-xs text-muted-foreground">Learn Smarter, Not Harder</p>
            </div>
          </div>

          {/* Global Search */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <GlobalSearch onNavigate={onTabChange} />
          </div>

          {/* Navigation Items */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    'relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200',
                    'hover:bg-muted/50 active:scale-95',
                    isActive && 'text-foreground',
                    !isActive && 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn(
                      'w-4 h-4 transition-transform',
                      isActive && 'scale-110'
                    )} />
                    <span>{item.label}</span>
                  </div>
                  
                  {isActive && (
                    <div className={cn(
                      'absolute bottom-0 left-0 right-0 h-0.5 rounded-full',
                      'bg-gradient-to-r', item.gradient,
                      'animate-scale-in'
                    )} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <select
              value={activeTab}
              onChange={(e) => onTabChange(e.target.value as TabType)}
              className="px-3 py-2 rounded-lg bg-muted border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {navItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Command Palette Hint & Profile */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {}}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-all text-sm text-muted-foreground"
              title="Press Cmd+K or Ctrl+K"
            >
              <Command className="w-4 h-4" />
              <span>⌘K</span>
            </button>
            
            {user && (
              <button
                onClick={() => onTabChange('profile')}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all',
                  activeTab === 'profile' 
                    ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30' 
                    : 'bg-muted/50 hover:bg-muted'
                )}
                title="Profile"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                  {user.email?.[0].toUpperCase()}
                </div>
                <span className="hidden md:inline text-sm font-medium">Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
