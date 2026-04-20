import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Subject {
  id: string;
  name: string;
  credits: number;
  semester: number;
  marks?: number;
  grade?: string;
  isCurrentSemester: boolean;
}

interface SubjectsStore {
  subjects: Subject[];
  isLoading: boolean;
  fetchSubjects: () => Promise<void>;
  addSubject: (subject: Omit<Subject, 'id' | 'grade'>) => Promise<void>;
  editSubject: (id: string, updates: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  calculateGrade: (marks: number) => string;
  calculateGPA: (subjects: Subject[]) => number;
  getOverallCGPA: () => number;
  getSemesterSubjects: (semester: number) => Subject[];
  getAllSemesters: () => number[];
}

export const calculateGrade = (marks: number): string => {
  if (marks >= 90) return 'O';
  if (marks >= 80) return 'A+';
  if (marks >= 70) return 'A';
  if (marks >= 60) return 'B+';
  if (marks >= 55) return 'B';
  if (marks >= 50) return 'C';
  if (marks >= 45) return 'P';
  return 'F';
};

const gradeToPoint = (grade: string): number => {
  const map: Record<string, number> = {
    O: 10, 'A+': 9, A: 8, 'B+': 7, B: 6, C: 5, P: 4, F: 0,
  };
  return map[grade] ?? 0;
};

export const calculateGPA = (subjects: Subject[]): number => {
  const withMarks = subjects.filter((s) => s.marks !== undefined);
  if (withMarks.length === 0) return 0;
  const totalCredits = withMarks.reduce((a, b) => a + b.credits, 0);
  const weightedPoints = withMarks.reduce((a, b) => {
    const grade = calculateGrade(b.marks!);
    return a + gradeToPoint(grade) * b.credits;
  }, 0);
  return totalCredits === 0 ? 0 : Math.round((weightedPoints / totalCredits) * 100) / 100;
};

function mapRow(s: Record<string, unknown>): Subject {
  const marks = s.marks !== null && s.marks !== undefined ? (s.marks as number) : undefined;
  return {
    id: s.id as string,
    name: s.name as string,
    credits: s.credits as number,
    semester: s.semester as number,
    marks,
    grade: marks !== undefined ? calculateGrade(marks) : undefined,
    isCurrentSemester: s.is_current as boolean,
  };
}

export const useSubjectsStore = create<SubjectsStore>((set, get) => ({
  subjects: [],
  isLoading: false,

  fetchSubjects: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      set({ isLoading: false });
      return;
    }

    set({ subjects: (data ?? []).map(mapRow), isLoading: false });
  },

  addSubject: async (subject) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('subjects')
      .insert({
        user_id: user.id,
        name: subject.name,
        credits: subject.credits,
        semester: subject.semester,
        marks: subject.marks ?? null,
        is_current: subject.isCurrentSemester,
      })
      .select()
      .single();

    if (error || !data) return;

    set((state) => ({ subjects: [...state.subjects, mapRow(data)] }));
  },

  editSubject: async (id, updates) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.credits !== undefined) dbUpdates.credits = updates.credits;
    if (updates.semester !== undefined) dbUpdates.semester = updates.semester;
    if (updates.marks !== undefined) dbUpdates.marks = updates.marks;
    if (updates.isCurrentSemester !== undefined) dbUpdates.is_current = updates.isCurrentSemester;

    const { error } = await supabase.from('subjects').update(dbUpdates).eq('id', id);
    if (error) return;

    set((state) => ({
      subjects: state.subjects.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, ...updates };
        if (updates.marks !== undefined) updated.grade = calculateGrade(updates.marks);
        return updated;
      }),
    }));
  },

  deleteSubject: async (id) => {
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) return;
    set((state) => ({ subjects: state.subjects.filter((s) => s.id !== id) }));
  },

  calculateGrade,
  calculateGPA,

  getOverallCGPA: () => calculateGPA(get().subjects.filter((s) => s.marks !== undefined)),

  getSemesterSubjects: (semester) => get().subjects.filter((s) => s.semester === semester),

  getAllSemesters: () => {
    const sems = [...new Set(get().subjects.map((s) => s.semester))];
    return sems.sort((a, b) => b - a);
  },
}));
