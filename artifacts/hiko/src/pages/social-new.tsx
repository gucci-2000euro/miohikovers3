import { useState } from 'react';
import { useLocation } from 'wouter';
import { useFeedStore } from '@/store/useFeedStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';

const MOCK_IMAGES = [
  '/images/post1.png',
  '/images/post2.png',
  '/images/post3.png',
  '/images/post4.png'
];

export default function SocialNew() {
  const [, setLocation] = useLocation();
  const { addPost } = useFeedStore();
  const user = useAuthStore(state => state.user);
  
  const [selectedImage, setSelectedImage] = useState<string>(MOCK_IMAGES[0]);
  const [caption, setCaption] = useState('');

  const handlePublish = () => {
    if (!user) return;
    addPost({
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      timeAgo: 'Just now',
      imageUrl: selectedImage,
      caption
    });
    setLocation('/social');
  };

  return (
    <div className="min-h-screen bg-hiko-deep text-white pb-24">
      <div className="sticky top-0 z-20 bg-hiko-deep/90 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={() => setLocation('/social')} className="p-2 glass-panel rounded-full hover:bg-white/20 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">New Post</h1>
        </div>
        <button 
          onClick={handlePublish}
          disabled={!caption.trim()}
          className="text-hiko-primary font-bold disabled:opacity-50 transition-opacity"
        >
          Publish
        </button>
      </div>

      <div className="p-6">
        <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-black/40 border border-white/10">
          <img src={selectedImage} alt="Selected" className="w-full h-full object-cover" />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
          {MOCK_IMAGES.map(img => (
            <button 
              key={img} 
              onClick={() => setSelectedImage(img)}
              className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-colors ${selectedImage === img ? 'border-hiko-primary' : 'border-transparent'}`}
            >
              <img src={img} alt="Thumb" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        <div className="glass-panel rounded-2xl p-4 mt-2">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="How was your run?..."
            className="w-full bg-transparent border-none resize-none focus:outline-none text-white placeholder:text-white/40 h-32"
          />
        </div>
      </div>
    </div>
  );
}
