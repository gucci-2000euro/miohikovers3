import { useState } from 'react';
import { useFeedStore } from '@/store/useFeedStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useCommentsStore } from '@/store/useCommentsStore';
import { useMessagesStore } from '@/store/useMessagesStore';
import { Heart, MessageCircle, Plus, Users, MessageSquare, Search, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { CommentsSheet } from '@/components/CommentsSheet';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { CommunityCard } from '@/components/community/CommunityCard';
import type { Community } from '@/types/index';

type Tab = 'feed' | 'community';

export default function Social() {
  const { posts, toggleLike } = useFeedStore();
  const requireAuth = useAuthStore(s => s.requireAuth);
  const user = useAuthStore(s => s.user);
  const [, setLocation] = useLocation();
  const { getByPost } = useCommentsStore();
  const totalUnread = useMessagesStore(s => s.totalUnread());

  const [tab, setTab] = useState<Tab>('feed');
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data: communities = [], isLoading: loadingCommunities } = useQuery<Community[]>({
    queryKey: ['communities', search],
    queryFn: async () => {
      let q = supabase.from('communities').select('*').order('membri_count', { ascending: false });
      if (search) q = q.ilike('nome', `%${search}%`);
      const { data } = await q.limit(30);
      return (data ?? []) as Community[];
    },
    enabled: tab === 'community',
    staleTime: 30_000,
  });

  const handleLike = (postId: string) => {
    requireAuth('Sign in to like posts and join the community.', () => toggleLike(postId));
  };

  const handleComment = (postId: string) => {
    setCommentPostId(postId);
  };

  const handleNew = () => {
    requireAuth('Sign in to share your run.', () => setLocation('/social/new'));
  };

  const handleJoin = (c: Community) => {
    requireAuth('Accedi per unirti a una community.', () => setLocation(`/community/${c.id}`));
  };

  return (
    <div className="min-h-screen bg-hiko-deep text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-hiko-deep/90 backdrop-blur-md px-6 py-4 border-b border-white/10">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <h1 className="text-2xl font-bold">Social</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={tab === 'feed'
                ? handleNew
                : () => requireAuth('Accedi per creare una community.', () => setLocation('/community/create'))
              }
              className="p-2 glass-panel rounded-full hover:bg-white/20 transition-colors"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={() => requireAuth('Sign in to message runners.', () => setLocation('/messages'))}
              className="p-2 glass-panel rounded-full hover:bg-white/20 transition-colors relative"
              data-testid="header-messages"
            >
              <MessageSquare size={20} />
              {user && totalUnread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-hiko-primary rounded-full text-[9px] font-bold text-hiko-deep flex items-center justify-center">
                  {totalUnread}
                </span>
              )}
            </button>
            <Link href="/social/friends" className="p-2 glass-panel rounded-full hover:bg-white/20 transition-colors">
              <Users size={20} />
            </Link>
          </div>
        </div>

        {/* Toggle Feed / Community */}
        <div className="flex bg-white/5 rounded-xl p-1">
          <button
            onClick={() => setTab('feed')}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
              tab === 'feed' ? 'bg-hiko-primary text-hiko-deep' : 'text-white/50 hover:text-white'
            }`}
          >
            Feed
          </button>
          <button
            onClick={() => setTab('community')}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
              tab === 'community' ? 'bg-hiko-primary text-hiko-deep' : 'text-white/50 hover:text-white'
            }`}
          >
            Community
          </button>
        </div>

        {/* Search bar (solo in tab community) */}
        {tab === 'community' && (
          <div className="relative mt-2">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cerca community..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-hiko-primary/50"
            />
          </div>
        )}
      </div>

      {/* ── FEED ─────────────────────────────────────── */}
      {tab === 'feed' && (
        <div className="space-y-6 pt-4">
        {posts.map((post) => {
          const comments = getByPost(post.id);
          return (
            <div key={post.id} className="bg-white/5 border-y border-white/5 pb-4">
              <div className="flex items-center gap-3 p-4">
                <img src={post.userAvatar} alt={post.userName} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                <div>
                  <p className="font-bold text-sm">{post.userName}</p>
                  <p className="text-xs text-white/50">{post.timeAgo}</p>
                </div>
              </div>

              <div className="w-full aspect-[4/3] bg-black/50 overflow-hidden">
                <img src={post.imageUrl} alt="Run post" className="w-full h-full object-cover" />
              </div>

              <div className="p-4 pb-2">
                <div className="flex items-center gap-4 mb-3">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 transition-transform active:scale-90"
                    data-testid={`like-${post.id}`}
                  >
                    <motion.div animate={post.isLiked ? { scale: [1, 1.2, 1] } : {}}>
                      <Heart
                        size={24}
                        className={post.isLiked ? 'text-hiko-primary fill-hiko-primary' : 'text-white hover:text-white/80'}
                      />
                    </motion.div>
                    <span className="font-medium">{post.likes}</span>
                  </button>
                  <button
                    onClick={() => handleComment(post.id)}
                    className="flex items-center gap-1.5 text-white hover:text-hiko-primary transition-colors"
                    data-testid={`comment-${post.id}`}
                  >
                    <MessageCircle size={24} />
                    <span className="font-medium">{comments.length}</span>
                  </button>
                </div>

                <p className="text-sm">
                  <span className="font-bold mr-2">{post.userName}</span>
                  <span className="text-white/90">{post.caption}</span>
                </p>

                {comments.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {comments.slice(0, 2).map((c) => (
                      <p key={c.id} className="text-sm">
                        <span className="font-bold mr-2 text-white/80">{c.userName}</span>
                        <span className="text-white/70">{c.text}</span>
                      </p>
                    ))}
                    {comments.length > 2 && (
                      <button
                        onClick={() => handleComment(post.id)}
                        className="text-xs font-medium text-white/50 mt-1 hover:text-white/70 transition-colors"
                      >
                        View all {comments.length} comments
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* ── COMMUNITY ─────────────────────────────────── */}
      {tab === 'community' && (
        <div className="px-4 pt-4">
          {loadingCommunities ? (
            <div className="flex justify-center py-16">
              <Loader2 size={32} className="text-hiko-primary animate-spin" />
            </div>
          ) : communities.length === 0 ? (
            <div className="text-center py-16 text-white/40">
              <p className="text-lg mb-1">Nessuna community trovata</p>
              <p className="text-sm">Creane una con il + in alto!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {communities.map(c => (
                <CommunityCard
                  key={c.id}
                  community={c}
                  onJoin={() => handleJoin(c)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <CommentsSheet
        postId={commentPostId ?? ''}
        isOpen={!!commentPostId}
        onClose={() => setCommentPostId(null)}
      />
    </div>
  );
}
