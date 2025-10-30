# SlideTutor AI - AI-Powered Learning Platform

## Overview
SlideTutor AI is a production-ready, feature-rich learning platform that transforms educational content into interactive lessons, quizzes, and flashcards using AI. Built with modern web technologies and a beautiful, dark-mode-only UI.

## 🎯 Current Status

### ✅ Phase 1 Complete (Production-Ready Foundation)
- **Dark Mode Only**: Enforced across entire application, light mode removed
- **Mandatory Authentication**: Supabase auth required for all users
- **Comprehensive Database Schema**: Full SQL schema with 17 table groups for all planned features
- **React Query Setup**: Infrastructure for Supabase data management
- **TypeScript Types**: Complete database types for type-safe development

### 🚧 In Progress (Phase 2-5)
The foundational infrastructure is complete. The following phases require additional development:

**Phase 2: localStorage → Supabase Migration**
- Replace all localStorage with Supabase-backed storage
- Migrate uploads, lessons, flashcards, quizzes, chat to database
- Secure API key storage in user profiles

**Phase 3: New Features**
- Study streaks & gamification (XP, levels, achievements)
- Enhanced analytics dashboard with charts
- Note-taking system with rich text editor
- Study groups & collaborative features
- AI-powered recommendations
- Global search across content
- Export/share functionality
- Goals, milestones & notifications
- Leaderboards

**Phase 4: UX/UI Polish**
- Error boundaries & loading states
- Mobile responsive enhancements
- Onboarding tour for new users
- Accessibility improvements

**Phase 5: Production Readiness**
- End-to-end testing
- Performance optimization
- Final documentation

## 🚀 Key Features

### 🎨 Beautiful UI/UX
- **Dark Mode Only**: Sleek, modern dark theme optimized for extended study sessions
- **Glass Morphism Effects**: Modern frosted-glass design elements
- **Gradient Animations**: Dynamic, animated gradient backgrounds
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Accessibility**: Full keyboard navigation, ARIA labels, and screen reader support

### 🔐 Security & Authentication
- **Mandatory Authentication**: All users must sign in via Supabase
- **Row Level Security**: Database policies ensure users only access their own data
- **Secure Sessions**: Auto-refresh tokens and persistent sessions
- **Social Auth**: Google and GitHub OAuth supported

### 📚 Core Learning Features
- **AI-Powered Lessons**: Generate comprehensive lessons from uploaded content
- **Adaptive Quizzes**: Multiple question types with explanations and adaptive difficulty
- **Smart Flashcards**: Spaced repetition (SM-2 algorithm) for optimal retention
- **Chat Q&A**: Ask questions about your documents with AI assistance
- **File Upload**: PDF and PPTX support with text extraction

### 🗄️ Database Architecture

The application uses Supabase (PostgreSQL) with the following structure:

**User Management**
- `user_profiles`: User data with XP, streaks, levels, preferences
- `user_achievements`: Achievement unlocks per user
- `user_streaks`: Daily study tracking

**Content Storage**
- `uploads`: File metadata and extracted content
- `lessons`: AI-generated and user-created lessons
- `notes`: Rich text notes with annotations
- `flashcard_decks` & `flashcards`: Spaced repetition cards

**Learning Activities**
- `quiz_sessions` & `quiz_questions`: Quiz attempts and results
- `chat_conversations` & `chat_messages`: AI chat history
- `study_sessions`: Time tracking and performance metrics

**Social & Gamification**
- `study_groups` & `group_members`: Collaborative learning
- `achievements`: Unlockable milestones
- `leaderboard_entries`: Competitive rankings
- `bookmarks`: Saved content
- `shared_content`: Public sharing with codes

**Smart Features**
- `study_recommendations`: AI-powered suggestions
- `user_goals`: Progress tracking
- `notifications`: System alerts
- `user_tags`: Custom organization

## 🔧 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom CSS Variables
- **State Management**: React Query + Zustand
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenRouter API (GPT-4, Claude, etc.)
- **File Processing**: PDF.js + JSZip
- **UI Components**: Radix UI + Lucide Icons
- **Rich Text**: TipTap Editor
- **Charts**: Recharts
- **Routing**: TanStack Router
- **Animations**: Framer Motion

## 📋 Environment Variables

Create a `.env` file or set these in your Replit Secrets:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenRouter API (REQUIRED for AI features)
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

### Getting API Keys

1. **Supabase** (Free tier available)
   - Go to https://supabase.com
   - Create a new project
   - Find your URL and anon key in Settings → API

2. **OpenRouter** (Pay-per-use)
   - Go to https://openrouter.ai
   - Sign up and get your API key
   - Add credits to your account

## 🚀 Getting Started

### 1. Set Up Supabase

Run the SQL schema to create all necessary tables:

```bash
# In your Supabase SQL Editor, run:
supabase/schema.sql
```

This creates:
- All tables with proper relationships
- Row Level Security policies
- Indexes for performance
- Trigger functions
- Default achievements

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Add the required environment variables (see above).

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5000`

### 5. Build for Production

```bash
npm run build
npm run preview
```

## 📱 Features in Detail

### Upload & Processing
- Drag & drop PDF and PPTX files
- Automatic text extraction
- Progress tracking
- Error handling with retry

### AI Lesson Generation
- Beginner, Intermediate, Advanced levels
- Structured content with explanations
- Examples and tips
- Quick quizzes

### Flashcard System
- SM-2 spaced repetition algorithm
- Difficulty tracking
- Review scheduling
- Statistics and progress

### Quiz System
- Multiple choice questions
- Instant feedback
- Explanations for answers
- Session history

### Chat Interface
- Context-aware AI responses
- Document-based Q&A
- Conversation history
- Model selection

## 🎨 Customization

### Dark Mode Colors
Colors are defined in `src/lib/theme.ts`:
- Primary: Pink (#FF6384)
- Secondary: Indigo (#818CF8)
- Accent: Pink (#F472B6)
- Background: Deep dark (#0A0A0F)
- Card: Dark slate (#0F141E)

### Custom Achievements
Add new achievements in the SQL schema's seed data section.

## 🔒 Security

### Row Level Security (RLS)
All tables have RLS enabled with policies that:
- Restrict data access to authenticated users
- Ensure users only see their own data
- Allow public access for shared content
- Enforce group membership for collaborative features

### Authentication
- Email/password with confirmation
- Google OAuth
- GitHub OAuth
- Session persistence
- Auto token refresh

## 📊 Database Indexes

Performance-optimized indexes on:
- User lookups
- Time-based queries (created_at, updated_at)
- Full-text search fields
- Foreign key relationships
- Leaderboard rankings

## 🎯 Gamification System

### XP & Levels
- Earn XP for study activities
- Level up formula: `FLOOR(1 + SQRT(1 + 8 * XP / 100) / 2)`
- Track total XP and current level

### Achievements
- 4 tiers: Bronze, Silver, Gold, Platinum
- 5 categories: Streak, Mastery, Social, Milestone, Special
- Automatic unlocking based on criteria
- XP rewards on unlock

### Streaks
- Daily study tracking
- Current and longest streak
- Streak warnings
- Achievements for consistency

### Leaderboards
- Daily, Weekly, Monthly, All-time
- Categories: XP, Streak, Study Time, Mastery
- Rank tracking
- Privacy controls

## 🚢 Deployment

### Replit Deployment (Recommended)
1. Configure all environment variables in Replit Secrets
2. Run the SQL schema in your Supabase project
3. Click "Deploy" in Replit
4. The app is configured for autoscale deployment

### Manual Deployment
The app can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages (with API proxy)
- AWS S3 + CloudFront

Build command: `npm run build`  
Output directory: `dist`

## 📝 Development Notes

### Code Organization
```
src/
├── components/       # React components
│   ├── auth/        # Authentication
│   ├── enhanced/    # Modern UI components
│   └── ui/          # Base UI components
├── contexts/        # React contexts
├── hooks/           # Custom hooks
│   └── useSupabaseQuery.ts  # React Query hooks
├── lib/             # Utilities & config
├── services/        # Business logic
├── types/           # TypeScript types
└── App.tsx          # Main app component
```

### State Management
- **React Query**: Server state (Supabase data)
- **Zustand**: Flashcard context
- **React Context**: Auth, theme
- **useState**: Local component state

### File Processing
- PDF: PDF.js for text extraction
- PPTX: JSZip + XML parsing
- Text chunking for AI processing

## 🐛 Troubleshooting

### Supabase Connection Issues
- Verify environment variables are set correctly
- Check Supabase project status
- Ensure RLS policies are applied
- Check browser console for errors

### AI Generation Fails
- Verify OpenRouter API key
- Check API credit balance
- Ensure file content was extracted properly
- Try with smaller files first

### Build Errors
- Clear node_modules and reinstall
- Update dependencies
- Check for TypeScript errors
- Verify all imports are correct

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [OpenRouter API](https://openrouter.ai/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)

## 🤝 Contributing

This is an educational project. Key areas for contribution:
- Additional AI models and providers
- More file format support
- Enhanced analytics
- Mobile app version
- Collaborative features
- More gamification elements

## 📄 License

MIT License - Feel free to use for learning and personal projects.

## 🎓 Learning Path

Recommended order for understanding the codebase:
1. Database schema (`supabase/schema.sql`)
2. Type definitions (`src/types/database.ts`)
3. Supabase setup (`src/lib/supabase.ts`)
4. React Query hooks (`src/hooks/useSupabaseQuery.ts`)
5. Auth flow (`src/contexts/AuthContext.tsx`)
6. Main app (`src/App.tsx`)
7. Feature components (`src/components/`)

## 🔮 Future Enhancements

**Planned Features:**
- Voice input for notes
- Mobile apps (React Native)
- Offline mode with sync
- Collaborative editing
- Video content support
- Custom AI model training
- Integration with LMS platforms
- Browser extension
- Desktop app (Electron)

**Technical Improvements:**
- WebSocket real-time updates
- Service workers for offline
- Advanced caching strategies
- GraphQL API layer
- Microservices architecture
- Kubernetes deployment
- CI/CD pipelines
- Automated testing suite

---

**Made with ❤️ for learners everywhere**
