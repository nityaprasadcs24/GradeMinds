import { create } from 'zustand';
import { supabase } from '../lib/supabase';

type Category = 'assignment' | 'revision' | 'quiz' | 'lab' | null;

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  category: Category;
  createdAt: number;
}

interface TodoStore {
  todos: Todo[];
  isLoading: boolean;
  fetchTodos: () => Promise<void>;
  addTodo: (text: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  cycleCategory: (id: string) => Promise<void>;
}

const CATEGORIES: Category[] = [null, 'assignment', 'revision', 'quiz', 'lab'];

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  isLoading: false,

  fetchTodos: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) { set({ isLoading: false }); return; }

    const mapped: Todo[] = (data ?? []).map((t: Record<string, unknown>) => ({
      id: t.id as string,
      text: t.text as string,
      completed: t.completed as boolean,
      category: (t.category ?? null) as Category,
      createdAt: new Date(t.created_at as string).getTime(),
    }));

    set({ todos: mapped, isLoading: false });
  },

  addTodo: async (text) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('todos')
      .insert({ user_id: user.id, text, completed: false, category: null })
      .select()
      .single();

    if (error || !data) return;

    set((state) => ({
      todos: [...state.todos, {
        id: data.id as string,
        text: data.text as string,
        completed: data.completed as boolean,
        category: (data.category ?? null) as Category,
        createdAt: new Date(data.created_at as string).getTime(),
      }],
    }));
  },

  toggleTodo: async (id) => {
    const todo = get().todos.find((t) => t.id === id);
    if (!todo) return;

    const { error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', id);

    if (error) return;

    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }));
  },

  deleteTodo: async (id) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) return;
    set((state) => ({ todos: state.todos.filter((t) => t.id !== id) }));
  },

  cycleCategory: async (id) => {
    const todo = get().todos.find((t) => t.id === id);
    if (!todo) return;

    const currentIndex = CATEGORIES.indexOf(todo.category);
    const nextCategory = CATEGORIES[(currentIndex + 1) % CATEGORIES.length];

    const { error } = await supabase
      .from('todos')
      .update({ category: nextCategory })
      .eq('id', id);

    if (error) return;

    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, category: nextCategory } : t
      ),
    }));
  },
}));
