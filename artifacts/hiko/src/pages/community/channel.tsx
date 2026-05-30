import { useEffect, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { useCommunityStore } from '@/store/useCommunityStore';
import { useCommunityMessages } from '@/hooks/useCommunityMessages';
import { MessageBubble } from '@/components/community/MessageBubble';
import { MessageComposer } from '@/components/community/MessageComposer';
import type { CommunityChannel } from '@/types/index';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function ChannelView() {
  const { id, channelId } = useParams<{ id: string; channelId: string }>();
  const [, setLocation] = useLocation();
  const user = useAuthStore(s => s.user);
  const requireAuth = useAuthStore(s => s.requireAuth);
  const { messages, setActiveChannel } = useCommunityStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: channel, isLoading } = useQuery<CommunityChannel>({
    queryKey: ['channel', channelId],
    queryFn: async () => {
      const { data } = await supabase.from('community_channels').select('*').eq('id', channelId).single();
      return data as CommunityChannel;
    },
    enabled: !!channelId,
  });

  useCommunityMessages(channelId ?? null);

  useEffect(() => {
    if (channel) setActiveChannel(channel);
  }, [channel, setActiveChannel]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (partial: Partial<{ channel_id: string; contenuto: string }>): Promise<string | null> => {
    if (!user) {
      requireAuth('Accedi per scrivere nella community', () => {});
      return null;
    }
    if (!channelId) return null;
    const { data, error } = await supabase.from('community_messages').insert({
      channel_id: channelId,
      user_id: user.id,
      contenuto: partial.contenuto,
      tipo: 'testo',
    }).select('*').single();
    if (data && !error) {
      useCommunityStore.getState().addMessage(data as import('@/types/index').CommunityMessage);
    }
    return data?.id ?? null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-hiko-deep">
        <Loader2 size={32} className="text-hiko-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-hiko-deep">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-hiko-deep/90 backdrop-blur-md">
        <button onClick={() => setLocation(`/community/${id}`)} className="text-white/60 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <p className="text-white font-bold">{channel?.nome ?? 'Canale'}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            currentUserId={user?.id ?? ''}
            onReact={async (emoji) => {
              if (!user) return;
              await supabase.from('community_reactions').upsert({ message_id: msg.id, user_id: user.id, emoji });
            }}
            onReport={() => {}}
            onReply={() => {}}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <MessageComposer
        channelId={channelId ?? ''}
        onSend={handleSend}
        readOnly={!!(channel?.solo_admin && !user)}
      />
    </div>
  );
}
