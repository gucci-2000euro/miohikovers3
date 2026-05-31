import { create } from 'zustand';
import type { Community, CommunityChannel, CommunityMember, CommunityMessage, CommunityMessageWithProfile, CommunityReaction } from '@/types/index';

interface CommunityState {
  activeCommunity: Community | null;
  activeChannel: CommunityChannel | null;
  messages: CommunityMessageWithProfile[];
  membership: CommunityMember | null;
  setActiveCommunity: (community: Community | null) => void;
  setActiveChannel: (channel: CommunityChannel | null) => void;
  setMessages: (messages: CommunityMessageWithProfile[]) => void;
  addMessage: (message: CommunityMessageWithProfile) => void;
  removeMessage: (messageId: string) => void;
  updateMessage: (messageId: string, patch: Partial<CommunityMessage>) => void;
  updateReactions: (messageId: string, reactions: CommunityReaction[]) => void;
  setMembership: (membership: CommunityMember | null) => void;
}

export const useCommunityStore = create<CommunityState>((set) => ({
  activeCommunity: null,
  activeChannel: null,
  messages: [],
  membership: null,

  setActiveCommunity: (community) => set({ activeCommunity: community }),
  setActiveChannel: (channel) => set({ activeChannel: channel, messages: [] }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((s) => ({
    messages: s.messages.some(m => m.id === message.id) ? s.messages : [...s.messages, message],
  })),
  removeMessage: (messageId) => set((s) => ({
    messages: s.messages.map(m => m.id === messageId ? { ...m, eliminato: true } : m),
  })),
  updateMessage: (messageId, patch) => set((s) => ({
    messages: s.messages.map(m => m.id === messageId ? { ...m, ...patch } : m),
  })),
  updateReactions: (_messageId, _reactions) => {
    // stored separately in DB; UI refreshes from subscription
  },
  setMembership: (membership) => set({ membership }),
}));
