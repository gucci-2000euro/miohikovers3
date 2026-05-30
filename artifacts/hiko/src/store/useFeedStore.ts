// Feed state is now managed via React Query + Supabase.
// This file is kept only for the Post type export used across the app.

export interface Post {
  id: string;
  user_id: string;
  image_url: string | null;
  caption: string;
  created_at: string;
  // joined from profiles
  nome: string | null;
  avatar_url: string | null;
  // computed client-side
  likes_count: number;
  is_liked: boolean;
}
