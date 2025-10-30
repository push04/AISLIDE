import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../types/database';

type Tables = Database['public']['Tables'];

// Hook for fetching user profile
export function useUserProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!supabase || !user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!supabase,
  });
}

// Hook for updating user profile
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (updates: Tables['user_profiles']['Update']) => {
      if (!supabase || !user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
    },
  });
}

// Hook for fetching uploads
export function useUploads() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['uploads', user?.id],
    queryFn: async () => {
      if (!supabase || !user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('uploads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!supabase,
  });
}

// Hook for creating an upload
export function useCreateUpload() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (upload: Tables['uploads']['Insert']) => {
      if (!supabase || !user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('uploads')
        .insert({ ...upload, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploads', user?.id] });
    },
  });
}

// Hook for deleting an upload
export function useDeleteUpload() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (uploadId: string) => {
      if (!supabase || !user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('uploads')
        .delete()
        .eq('id', uploadId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploads', user?.id] });
    },
  });
}

// Hook for fetching lessons
export function useLessons() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['lessons', user?.id],
    queryFn: async () => {
      if (!supabase || !user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!supabase,
  });
}

// Hook for creating a lesson
export function useCreateLesson() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (lesson: Tables['lessons']['Insert']) => {
      if (!supabase || !user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('lessons')
        .insert({ ...lesson, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', user?.id] });
    },
  });
}

// Hook for fetching flashcard decks
export function useFlashcardDecks() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['flashcard-decks', user?.id],
    queryFn: async () => {
      if (!supabase || !user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('flashcard_decks')
        .select('*, flashcards(count)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!supabase,
  });
}

// Hook for creating a flashcard deck
export function useCreateFlashcardDeck() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (deck: Tables['flashcard_decks']['Insert']) => {
      if (!supabase || !user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('flashcard_decks')
        .insert({ ...deck, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-decks', user?.id] });
    },
  });
}

// Hook for fetching flashcards by deck
export function useFlashcards(deckId: string | null) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['flashcards', deckId],
    queryFn: async () => {
      if (!supabase || !user || !deckId) throw new Error('Not authenticated or no deck selected');
      
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('deck_id', deckId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!supabase && !!deckId,
  });
}

// Hook for creating a flashcard
export function useCreateFlashcard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (flashcard: Tables['flashcards']['Insert']) => {
      if (!supabase) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('flashcards')
        .insert(flashcard)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', data.deck_id] });
      queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] });
    },
  });
}

// Hook for updating a flashcard (for SM-2 algorithm)
export function useUpdateFlashcard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Tables['flashcards']['Update'] }) => {
      if (!supabase) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('flashcards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['flashcards', data.deck_id] });
    },
  });
}

// Hook for fetching chat conversations
export function useChatConversations() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['chat-conversations', user?.id],
    queryFn: async () => {
      if (!supabase || !user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false, nullsFirst: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!supabase,
  });
}

// Hook for fetching chat messages for a conversation
export function useChatMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['chat-messages', conversationId],
    queryFn: async () => {
      if (!supabase || !conversationId) throw new Error('No conversation selected');
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!supabase && !!conversationId,
  });
}

// Hook for creating a chat conversation
export function useCreateChatConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (conversation: Tables['chat_conversations']['Insert']) => {
      if (!supabase || !user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({ ...conversation, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations', user?.id] });
    },
  });
}

// Hook for creating a chat message
export function useCreateChatMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (message: Tables['chat_messages']['Insert']) => {
      if (!supabase) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(message)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update conversation's last_message_at and message_count
      await supabase
        .from('chat_conversations')
        .update({
          last_message_at: new Date().toISOString(),
          message_count: supabase.rpc('increment', { x: 1 }) as any,
        })
        .eq('id', message.conversation_id);
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', data.conversation_id] });
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    },
  });
}
