import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface User {
  name: string;
  email: string;
  college: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  avatar: string;
  phone: string;
  college: string;
  branch: string;
  semester: number;
  usn: string;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<AuthState>) => Promise<void>;
}

const INITIAL: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  session: null,
  user: null,
  avatar: '',
  phone: '',
  college: '',
  branch: '',
  semester: 0,
  usn: '',
};

function deriveUserFromSession(session: Session): Pick<AuthState, 'user' | 'avatar'> {
  const email = session.user.email ?? '';
  const metaName = session.user.user_metadata?.full_name as string | undefined;
  const namePart = metaName || email.split('@')[0] || 'Student';
  const name = metaName
    ? namePart
    : namePart
        .split('.')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return {
    user: { name, email, college: '' },
    avatar: initials,
  };
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  ...INITIAL,

  login: async (email, password) => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ isLoading: false });
      return error.message;
    }
    if (data.session) {
      const derived = deriveUserFromSession(data.session);
      set({
        isAuthenticated: true,
        isLoading: false,
        session: data.session,
        ...derived,
      });
    }
    return null;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set(INITIAL);
  },

  restoreSession: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const derived = deriveUserFromSession(data.session);
      set({
        isAuthenticated: true,
        session: data.session,
        ...derived,
      });
    }
  },

  fetchProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      const name = (data.name as string | null) ?? user.email?.split('@')[0] ?? 'Student';
      const initials = name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      set({
        user: { name, email: user.email ?? '', college: (data.college as string | null) ?? '' },
        avatar: initials,
        phone: (data.phone as string | null) ?? '',
        branch: (data.branch as string | null) ?? '',
        semester: (data.semester as number | null) ?? 0,
        usn: (data.usn as string | null) ?? '',
      });
    }
  },

  updateProfile: async (updates) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const dbUpdates: Record<string, unknown> = {};
    if (updates.user?.name) dbUpdates.name = updates.user.name;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.branch !== undefined) dbUpdates.branch = updates.branch;
    if (updates.semester !== undefined) dbUpdates.semester = updates.semester;
    if (updates.usn !== undefined) dbUpdates.usn = updates.usn;

    await supabase.from('profiles').update(dbUpdates).eq('id', user.id);

    set((state) => ({ ...state, ...updates }));
  },
}));
