import { create } from 'zustand';
import { sendMessage } from '../lib/groq';

type GroqMessage = { role: 'user' | 'assistant'; content: string };

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type QGenStore = {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
};

export const useQGenStore = create<QGenStore>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

  sendMessage: async (content: string) => {
    const userMsg: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isLoading: true,
      error: null,
    }));

    try {
      const history: GroqMessage[] = [...get().messages].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendMessage(history);

      const botMsg: ChatMessage = {
        id: `${Date.now()}-bot`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, botMsg],
        isLoading: false,
      }));
    } catch (err) {
      console.error("Store error:", err);
      set({ isLoading: false, error: 'Q-Gen is unavailable, try again.' });
    }
  },

  clearChat: () => set({ messages: [], error: null }),
}));
