import { create } from 'zustand';

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  timeAgo: string;
  imageUrl: string;
  caption: string;
  likes: number;
  isLiked: boolean;
  comments: { user: string; text: string }[];
}

interface FeedState {
  posts: Post[];
  toggleLike: (postId: string) => void;
  addPost: (post: Omit<Post, 'id' | 'likes' | 'isLiked' | 'comments'>) => void;
}

// TODO [BE]: popolare posts dall'API — GET /api/feed?userId=... (post degli amici ordinati per data)
// TODO [FE2]: integrare con TanStack Query per paginazione e pull-to-refresh
export const useFeedStore = create<FeedState>((set) => ({
  posts: [],
  toggleLike: (postId) => set((state) => ({
    posts: state.posts.map(p =>
      p.id === postId
        ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
        : p
    ),
  })),
  addPost: (newPost) => set((state) => ({
    posts: [{
      ...newPost,
      id: `p${Date.now()}`,
      likes: 0,
      isLiked: false,
      comments: [],
    }, ...state.posts],
  })),
}));
