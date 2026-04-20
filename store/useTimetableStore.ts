import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type WeekDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export interface ClassSlot {
  id: string;
  subject: string;
  professor: string;
  room: string;
  startTime: string;
  endTime: string;
  day: WeekDay;
  color: string;
}

interface TimetableStore {
  classes: ClassSlot[];
  isLoading: boolean;
  selectedDay: WeekDay;
  setSelectedDay: (day: WeekDay) => void;
  fetchClasses: () => Promise<void>;
  addClass: (slot: Omit<ClassSlot, 'id'>) => Promise<void>;
  editClass: (id: string, updates: Partial<ClassSlot>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  getCurrentClass: () => ClassSlot | null;
  getClassesForDay: (day: WeekDay) => ClassSlot[];
}

const getTodayDay = (): WeekDay => {
  const days: WeekDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const d = new Date().getDay();
  return days[d - 1] ?? 'Mon';
};

export const useTimetableStore = create<TimetableStore>((set, get) => ({
  classes: [],
  isLoading: false,
  selectedDay: getTodayDay(),

  setSelectedDay: (day) => set({ selectedDay: day }),

  fetchClasses: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('timetable_slots')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) { set({ isLoading: false }); return; }

    const mapped: ClassSlot[] = (data ?? []).map((c: Record<string, unknown>) => ({
      id: c.id as string,
      subject: c.subject as string,
      professor: (c.professor ?? '') as string,
      room: (c.room ?? '') as string,
      startTime: c.start_time as string,
      endTime: c.end_time as string,
      day: c.day as WeekDay,
      color: (c.color ?? '#7C3AED') as string,
    }));

    set({ classes: mapped, isLoading: false });
  },

  addClass: async (slot) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('timetable_slots')
      .insert({
        user_id: user.id,
        subject: slot.subject,
        professor: slot.professor,
        room: slot.room,
        day: slot.day,
        start_time: slot.startTime,
        end_time: slot.endTime,
        color: slot.color,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('addClass insert error:', error);
      return;
    }

    console.log('Inserted class:', data);

    set((state) => ({
      classes: [...state.classes, {
        id: data.id as string,
        subject: data.subject as string,
        professor: (data.professor ?? '') as string,
        room: (data.room ?? '') as string,
        startTime: data.start_time as string,
        endTime: data.end_time as string,
        day: data.day as WeekDay,
        color: (data.color ?? '#7C3AED') as string,
      }],
    }));

    console.log('Classes after insert:', get().classes.length);
  },

  editClass: async (id, updates) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.subject !== undefined) dbUpdates.subject = updates.subject;
    if (updates.professor !== undefined) dbUpdates.professor = updates.professor;
    if (updates.room !== undefined) dbUpdates.room = updates.room;
    if (updates.day !== undefined) dbUpdates.day = updates.day;
    if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
    if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
    if (updates.color !== undefined) dbUpdates.color = updates.color;

    const { error } = await supabase.from('timetable_slots').update(dbUpdates).eq('id', id);
    if (error) return;

    set((state) => ({
      classes: state.classes.map((c) => c.id === id ? { ...c, ...updates } : c),
    }));
  },

  deleteClass: async (id) => {
    const { error } = await supabase.from('timetable_slots').delete().eq('id', id);
    if (error) return;
    set((state) => ({ classes: state.classes.filter((c) => c.id !== id) }));
  },

  getCurrentClass: () => {
    const now = new Date();
    const days: WeekDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayIndex = now.getDay();
    if (dayIndex === 0 || dayIndex === 6) return null;
    const today = days[dayIndex - 1];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return get().classes.find(
      (c) => c.day === today && c.startTime <= currentTime && c.endTime > currentTime
    ) ?? null;
  },

  getClassesForDay: (day) =>
    get()
      .classes.filter((c) => c.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
}));
