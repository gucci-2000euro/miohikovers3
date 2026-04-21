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

const mockPosts: Post[] = [
  {
    id: 'p1',
    userId: 'u2',
    userName: 'Alex Rivers',
    userAvatar: 'https://i.pravatar.cc/150?u=u2',
    timeAgo: '2h ago',
    imageUrl: '/images/post1.png',
    caption: 'Dusk run through the old city. The air is perfectly crisp tonight.',
    likes: 42,
    isLiked: false,
    comments: [
      { user: 'Sam', text: 'Beautiful shot!' },
      { user: 'Elena', text: 'Pace looks solid.' }
    ]
  },
  {
    id: 'p2',
    userId: 'u3',
    userName: 'Elena Trail',
    userAvatar: 'https://i.pravatar.cc/150?u=u3',
    timeAgo: '5h ago',
    imageUrl: '/images/post2.png',
    caption: 'Lost in the emerald woods. Highly recommend the northern ridge loop.',
    likes: 128,
    isLiked: true,
    comments: [
      { user: 'Alex', text: 'Need to try this route.' }
    ]
  },
  {
    id: 'p3',
    userId: 'u4',
    userName: 'David Urban',
    userAvatar: 'https://i.pravatar.cc/150?u=u4',
    timeAgo: '1d ago',
    imageUrl: '/images/post3.png',
    caption: 'Dawn patrol. Empty streets and perfect silence.',
    likes: 85,
    isLiked: false,
    comments: []
  }
];

export const useFeedStore = create<FeedState>((set) => ({
  posts: mockPosts,
  toggleLike: (postId) => set((state) => ({
    posts: state.posts.map(p => {
      if (p.id === postId) {
        return { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 };
      }
      return p;
    })
  })),
  addPost: (newPost) => set((state) => ({
    posts: [{
      ...newPost,
      id: `p${Date.now()}`,
      likes: 0,
      isLiked: false,
      comments: []
    }, ...state.posts]
  }))
}));
