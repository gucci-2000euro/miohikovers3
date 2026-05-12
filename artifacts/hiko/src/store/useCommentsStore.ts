import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Mirrors Supabase schema: comments(id, post_id, user_id, user_name, user_avatar, text, created_at, edited_at)
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
  editedAt?: string;
}

interface CommentsState {
  comments: Comment[];
  getByPost: (postId: string) => Comment[];
  addComment: (postId: string, userId: string, userName: string, userAvatar: string, text: string) => void;
  editComment: (commentId: string, text: string) => void;
  deleteComment: (commentId: string) => void;
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
export { formatRelative };

// TODO [BE]: caricare commenti per post — GET /api/comments?postId=...
// TODO [FE2]: sostituire persist locale con fetch dal server; il persist attuale è solo per uso offline
export const useCommentsStore = create<CommentsState>()(
  persist(
    (set, get) => ({
      comments: [],
      getByPost: (postId) => get().comments.filter(c => c.postId === postId),
      addComment: (postId, userId, userName, userAvatar, text) => {
        const comment: Comment = {
          id: `c${Date.now()}`,
          postId,
          userId,
          userName,
          userAvatar,
          text: text.trim(),
          createdAt: new Date().toISOString(),
        };
        set(s => ({ comments: [...s.comments, comment] }));
      },
      editComment: (commentId, text) => set(s => ({
        comments: s.comments.map(c =>
          c.id === commentId ? { ...c, text: text.trim(), editedAt: new Date().toISOString() } : c
        ),
      })),
      deleteComment: (commentId) => set(s => ({
        comments: s.comments.filter(c => c.id !== commentId),
      })),
    }),
    { name: 'hiko-comments' }
  )
);
