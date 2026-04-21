import { useFeedStore } from '@/store/useFeedStore';
import { Heart, MessageCircle, Plus, Users } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

export default function Social() {
  const { posts, toggleLike } = useFeedStore();

  return (
    <div className="min-h-screen bg-hiko-deep text-white pb-24">
      <div className="sticky top-0 z-20 bg-hiko-deep/90 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-white/10">
        <h1 className="text-2xl font-bold">Feed</h1>
        <Link href="/social/friends" className="p-2 glass-panel rounded-full hover:bg-white/20 transition-colors">
          <Users size={20} />
        </Link>
      </div>

      <div className="space-y-6 pt-4">
        {posts.map((post) => (
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
                  onClick={() => toggleLike(post.id)}
                  className="flex items-center gap-1.5 transition-transform active:scale-90"
                >
                  <motion.div
                    animate={post.isLiked ? { scale: [1, 1.2, 1] } : {}}
                  >
                    <Heart 
                      size={24} 
                      className={post.isLiked ? "text-hiko-primary fill-hiko-primary" : "text-white hover:text-white/80"} 
                    />
                  </motion.div>
                  <span className="font-medium">{post.likes}</span>
                </button>
                <button className="flex items-center gap-1.5 text-white hover:text-white/80 transition-colors">
                  <MessageCircle size={24} />
                  <span className="font-medium">{post.comments.length}</span>
                </button>
              </div>
              
              <p className="text-sm">
                <span className="font-bold mr-2">{post.userName}</span>
                <span className="text-white/90">{post.caption}</span>
              </p>
              
              {post.comments.length > 0 && (
                <div className="mt-3 space-y-1">
                  {post.comments.slice(0, 2).map((c, i) => (
                    <p key={i} className="text-sm">
                      <span className="font-bold mr-2 text-white/80">{c.user}</span>
                      <span className="text-white/70">{c.text}</span>
                    </p>
                  ))}
                  {post.comments.length > 2 && (
                    <button className="text-xs font-medium text-white/50 mt-1">View all {post.comments.length} comments</button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Link href="/social/new">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-28 right-6 w-14 h-14 bg-hiko-primary rounded-full flex items-center justify-center shadow-lg shadow-hiko-primary/20 z-30"
        >
          <Plus size={28} className="text-hiko-deep" />
        </motion.button>
      </Link>
    </div>
  );
}
