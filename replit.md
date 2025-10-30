# SlideTutor AI - AI-Powered Learning Platform

## Overview
SlideTutor AI is a production-ready learning platform designed to transform educational content into interactive lessons, quizzes, and flashcards using AI. It features a modern, dark-mode-only UI and aims to provide a comprehensive and engaging learning experience. The project emphasizes gamification, robust security, and a scalable architecture to support a rich set of learning activities and user interactions.

## User Preferences
I prefer simple language and clear explanations. I want iterative development with frequent, small updates rather than large, infrequent ones. Please ask before making any major architectural changes or introducing new dependencies. I prefer to be involved in decisions regarding UI/UX, especially color schemes and design patterns.

## System Architecture
The application is built with a strong focus on a dark-mode-only UI, featuring glass morphism effects and gradient animations for a sleek, modern aesthetic. It employs a responsive design for compatibility across devices and prioritizes accessibility with keyboard navigation and ARIA labels.

**Technical Implementations:**
-   **Frontend:** React 18, TypeScript, Vite
-   **Styling:** Tailwind CSS, Custom CSS Variables
-   **State Management:** React Query (server state), Zustand (flashcard context), React Context (auth, theme), useState (local component state)
-   **Authentication:** Supabase Auth (mandatory, RLS enabled, social auth supported)
-   **Database:** Supabase (PostgreSQL) with a comprehensive schema (23+ tables) for user profiles, content, learning activities, and gamification. RLS policies ensure data security.
-   **AI:** OpenRouter API (GPT-4, Claude, etc.) for content generation and Q&A.
-   **File Processing:** PDF.js for PDF text extraction, JSZip for PPTX.
-   **UI Components:** Radix UI, Lucide Icons
-   **Rich Text:** TipTap Editor
-   **Charts:** Recharts
-   **Routing:** TanStack Router
-   **Animations:** Framer Motion

**Feature Specifications:**
-   **AI-Powered Content:** Generate lessons, quizzes, and flashcards from uploaded PDF/PPTX files.
-   **Adaptive Learning:** Quizzes with multiple question types, explanations, and adaptive difficulty. Spaced repetition (SM-2 algorithm) for flashcards.
-   **Gamification:** XP, levels, streaks, achievements (4 tiers, 5 categories), and leaderboards (Daily, Weekly, Monthly, All-time).
-   **Content Management:** File uploads, bookmarks, custom tags, rich text notes.
-   **User Engagement:** Chat Q&A with AI, goals tracking, analytics dashboard, global search across all content.
-   **Security:** Mandatory Supabase authentication, Row Level Security, secure sessions with auto-refresh tokens.

**System Design Choices:**
-   **UI/UX:** Dark mode, glass morphism, gradient animations, responsive, accessible.
-   **Database:** Supabase (PostgreSQL) with a highly normalized schema and performance-optimized indexes.
-   **Modularity:** Clear code organization (`components`, `contexts`, `hooks`, `lib`, `services`, `types`).
-   **Deployment:** Configured for Replit deployment, also compatible with static hosting services.

## External Dependencies
-   **Supabase:** Database (PostgreSQL), Authentication, Realtime features.
-   **OpenRouter API:** AI model integration (GPT-4, Claude, etc.) for content generation and chat.
-   **PDF.js:** Library for PDF text extraction.
-   **JSZip:** Library for handling .zip archives, used in PPTX processing.
-   **React Query (TanStack Query):** Data fetching, caching, and state management for server data.
-   **Zustand:** Lightweight state management for specific local state (e.g., flashcard context).
-   **Tailwind CSS:** Utility-first CSS framework for styling.
-   **Radix UI:** Headless UI components.
-   **Lucide Icons:** Icon library.
-   **Recharts:** Charting library for data visualization.
-   **TanStack Router:** Type-safe routing.
-   **Framer Motion:** Animation library.
-   **TipTap Editor:** Rich text editor.