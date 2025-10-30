# SlideTutor AI - Next-Generation Learning Platform

## Overview
SlideTutor AI is a production-ready, feature-rich learning platform that transforms educational content into interactive lessons, quizzes, and flashcards using AI. Built with modern web technologies and a beautiful, accessible UI with dark/light themes.

## Key Features

### 🎨 Beautiful UI/UX
- **Dark/Light Theme Toggle**: Seamless theme switching with smooth transitions
- **Glass Morphism Effects**: Modern frosted-glass design elements
- **Gradient Animations**: Dynamic, animated gradient backgrounds
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Accessibility**: Full keyboard navigation, ARIA labels, and screen reader support

### 🚀 Core Learning Features
- **AI-Powered Lessons**: Generate comprehensive lessons from uploaded content
- **Adaptive Quizzes**: Multiple question types with explanations and adaptive difficulty
- **Smart Flashcards**: Spaced repetition (SM-2 algorithm) for optimal retention
- **Chat Q&A**: Ask questions about your documents with AI assistance

### 🔐 Production-Ready Features
- **Supabase Integration**: Database, authentication, storage, and realtime features
- **Environment Variables**: Secure API key management via Netlify
- **Error Handling**: Graceful fallbacks and user-friendly error messages
- **Performance**: Optimized bundle size and fast load times
- **Toast Notifications**: Beautiful feedback for user actions

## Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand + React Context + React Query
- **UI Components**: Custom components with Radix UI primitives
- **AI Provider**: OpenRouter API (multiple free and paid models)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **File Processing**: PDF.js and JSZip (CDN-loaded)
- **Animations**: Framer Motion + CSS animations
- **Rich Text**: TipTap editor for lesson creation

## Project Structure
```
src/
├── components/
│   ├── enhanced/          # New enhanced UI components
│   │   ├── EnhancedNavigation  # Beautiful nav with theme toggle
│   │   ├── EnhancedDashboard   # Modern dashboard
│   │   ├── Button              # Reusable button component
│   │   └── Card                # Glass morphism card components
│   ├── ChatInterface      # AI-powered Q&A
│   ├── Dashboard          # Legacy dashboard
│   ├── FlashcardManager   # Spaced repetition study
│   ├── LessonGenerator    # AI lesson creation
│   ├── QuizManager        # Quiz generation and taking
│   ├── Settings           # API key management
│   └── UploadManager      # File upload and processing
├── contexts/
│   ├── ThemeContext       # Dark/light theme management
│   ├── AuthContext        # Supabase authentication
│   └── FlashcardContext   # Flashcard state management
├── lib/
│   ├── theme.ts           # Theme configuration and utilities
│   ├── supabase.ts        # Supabase client setup
│   ├── openrouter.ts      # OpenRouter API integration
│   └── utils.ts           # Utility functions
├── hooks/                 # Custom React hooks
├── services/              # Business logic
└── index.css              # Global styles with CSS variables
```

## Design System

### Color Palette
- **Primary**: Pink gradient (#FF6384)
- **Secondary**: Indigo/Purple (#6366F1 → #8B5CF6)
- **Accent**: Pink/Rose (#EC4899)
- **Success/Warning/Error**: Semantic colors

### Theme Support
```typescript
// Themes automatically apply to all components
- Light mode: Clean, bright, professional
- Dark mode: Deep blues with vibrant accents
- Smooth transitions between themes
```

### Component Variants
- **Cards**: Default, Glass, Gradient
- **Buttons**: Primary, Secondary, Outline, Ghost, Danger
- **Animations**: Scale-in, Slide-up, Fade-in, Shimmer

## Recent Changes
- **2025-10-30 (Major Update)**: Production-ready transformation
  - Implemented beautiful dark/light theme system
  - Added glass morphism and gradient effects throughout UI
  - Created comprehensive design system with Tailwind
  - Integrated Supabase for database and authentication
  - Added enhanced navigation with theme toggle
  - Created reusable UI component library
  - Removed hardcoded API keys (security fix)
  - Added environment variable support
  - Implemented toast notifications
  - Enhanced dashboard with stats and quick actions
  - Added smooth animations and transitions
  - Improved accessibility and keyboard navigation

## Environment Variables

Create a `.env` file (see `.env.example`):

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenRouter API
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

**For Netlify Deployment**: Add these as environment variables in your Netlify dashboard.

## Supabase Database Schema

The app is ready for Supabase integration with the following schema:

### Tables
- `user_profiles`: User information and preferences
- `lessons`: AI-generated lessons with tags and metadata
- `flashcard_decks`: Flashcard collections
- `flashcards`: Individual flashcards with SM-2 algorithm data
- `quizzes`: Quiz metadata
- `quiz_attempts`: Quiz session tracking

### Features Ready
- Row Level Security (RLS) policies
- Real-time subscriptions for collaborative features
- Vector search for semantic lesson discovery
- File storage for uploads (PDFs, PPTX)

## Development

### Setup
```bash
npm install
npm run dev  # Starts on port 5000
```

### Building
```bash
npm run build  # Production build
npm run preview  # Preview production build
```

### Code Quality
```bash
npm run lint  # ESLint
```

## Production Deployment

### Netlify Setup
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OPENROUTER_API_KEY`

### Supabase Setup
1. Create a Supabase project
2. Run the SQL schema migrations (see database setup docs)
3. Enable Row Level Security
4. Configure storage buckets for file uploads
5. Set up authentication providers (email, Google, GitHub)

## Security Features
- ✅ No hardcoded API keys or secrets
- ✅ Environment variables for all sensitive data
- ✅ Supabase Row Level Security (RLS)
- ✅ Secure authentication with Supabase Auth
- ✅ Client-side validation and sanitization
- ✅ Graceful error handling

## Accessibility
- ✅ Keyboard navigation support
- ✅ ARIA labels and landmarks
- ✅ Focus visible states
- ✅ Screen reader friendly
- ✅ High contrast modes
- ✅ Reduced motion support

## Performance
- ✅ Code splitting and lazy loading
- ✅ Optimized bundle size
- ✅ Fast initial load (<2s)
- ✅ Smooth 60fps animations
- ✅ Efficient re-renders with React Query

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements
- Offline-first with Service Workers
- Real-time collaboration (study rooms)
- Shared decks and community features
- Analytics dashboard
- Command palette (⌘K)
- Data export/import
- Mobile app (React Native)

## License
Private - All rights reserved

## Support
For issues, questions, or feature requests, contact the development team.
