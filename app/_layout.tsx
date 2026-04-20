import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { useSubjectsStore } from '../store/useSubjectsStore';
import { useTodoStore } from '../store/useTodoStore';
import { useTimetableStore } from '../store/useTimetableStore';
import { supabase } from '../lib/supabase';

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Redirect unauthenticated users away from protected routes
  useEffect(() => {
    const inTabsGroup = segments[0] === '(tabs)';
    if (!isAuthenticated && inTabsGroup) {
      router.replace('/');
    }
  }, [isAuthenticated, segments]);

  useEffect(() => {
    // Restore existing session on mount, then fetch user data
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        useSubjectsStore.getState().fetchSubjects();
        useAuthStore.getState().fetchProfile();
        useTodoStore.getState().fetchTodos();
        useTimetableStore.getState().fetchClasses();
      }
    });
    useAuthStore.getState().restoreSession();

    // Listen for auth state changes (handles token refresh, sign-in from other tabs, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          const supaUser = session.user;
          const metaName = supaUser.user_metadata?.full_name as string | undefined;
          const namePart = metaName || supaUser.email?.split('@')[0] || 'Student';
          const name = metaName
            ? namePart
            : namePart
                .split('.')
                .map((n: string) => n.charAt(0).toUpperCase() + n.slice(1))
                .join(' ');
          const initials = name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
          useAuthStore.setState({
            isAuthenticated: true,
            session,
            user: { name, email: supaUser.email ?? '', college: '' },
            avatar: initials,
          });
          useSubjectsStore.getState().fetchSubjects();
          useAuthStore.getState().fetchProfile();
          useTodoStore.getState().fetchTodos();
          useTimetableStore.getState().fetchClasses();
        } else {
          useAuthStore.setState({
            isAuthenticated: false,
            session: null,
            user: null,
            avatar: '',
          });
          useSubjectsStore.setState({ subjects: [] });
          useTodoStore.setState({ todos: [] });
          useTimetableStore.setState({ classes: [] });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
