import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Linking, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: W } = Dimensions.get('window');

type Year   = '1' | '2' | '3' | '4';
type Branch = 'CSE' | 'CSDS' | 'CSBS' | 'ISE' | 'AIML' | 'ECE' | 'EEE';
type Tab    = 'courses' | 'leetcode' | 'qbank';

// ─── Subject map per year/branch (BMSCE VTU autonomous) ───────────────────────

const SUBJECT_MAP: Record<string, Record<string, string[]>> = {
  '1': {
    CSE:  ['Maths', 'Physics', 'C Programming', 'Engineering Graphics', 'Environmental Sci'],
    CSDS: ['Maths', 'Physics', 'C Programming', 'Engineering Graphics', 'Environmental Sci'],
    CSBS: ['Maths', 'Physics', 'C Programming', 'Engineering Graphics', 'Environmental Sci'],
    ISE:  ['Maths', 'Physics', 'C Programming', 'Engineering Graphics', 'Environmental Sci'],
    AIML: ['Maths', 'Physics', 'C Programming', 'Engineering Graphics', 'Environmental Sci'],
    ECE:  ['Maths', 'Physics', 'Basic Electronics', 'Engineering Graphics', 'Environmental Sci'],
    EEE:  ['Maths', 'Physics', 'Basic Electrical', 'Engineering Graphics', 'Environmental Sci'],
  },
  '2': {
    CSE:  ['DSA', 'OOP with Java', 'Discrete Maths', 'Digital Design', 'Microprocessors'],
    CSDS: ['DSA', 'OOP with Java', 'Discrete Maths', 'Probability & Stats', 'Linear Algebra'],
    CSBS: ['DSA', 'OOP with Java', 'Discrete Maths', 'Business Analytics', 'Accounting'],
    ISE:  ['DSA', 'OOP with Java', 'Discrete Maths', 'Digital Design', 'Microprocessors'],
    AIML: ['DSA', 'Python', 'Discrete Maths', 'Probability & Stats', 'Linear Algebra'],
    ECE:  ['Signals & Systems', 'Network Theory', 'Analog Electronics', 'Maths', 'Microcontrollers'],
    EEE:  ['Circuit Theory', 'Electrical Machines', 'Control Systems', 'Maths', 'Power Systems'],
  },
  '3': {
    CSE:  ['OS', 'DBMS', 'Computer Networks', 'Compiler Design', 'Software Engineering'],
    CSDS: ['OS', 'DBMS', 'Machine Learning', 'Big Data', 'Computer Networks'],
    CSBS: ['OS', 'DBMS', 'Business Intelligence', 'ERP Systems', 'Web Technologies'],
    ISE:  ['OS', 'DBMS', 'Computer Networks', 'Information Security', 'Web Technologies'],
    AIML: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'OS'],
    ECE:  ['VLSI Design', 'Embedded Systems', 'Digital Communication', 'Microprocessors', 'RF Engineering'],
    EEE:  ['Power Electronics', 'Electric Drives', 'Protection Systems', 'Instrumentation', 'Embedded Systems'],
  },
  '4': {
    CSE:  ['Cloud Computing', 'Cryptography', 'Distributed Systems', 'Big Data', 'Electives'],
    CSDS: ['Deep Learning', 'Reinforcement Learning', 'Data Engineering', 'MLOps', 'Electives'],
    CSBS: ['Digital Marketing', 'Fintech', 'Blockchain', 'Project Management', 'Electives'],
    ISE:  ['Cloud Security', 'Blockchain', 'IoT', 'DevOps', 'Electives'],
    AIML: ['Generative AI', 'MLOps', 'Robotics', 'AI Ethics', 'Electives'],
    ECE:  ['5G Networks', 'IoT', 'Advanced VLSI', 'Wireless Communication', 'Electives'],
    EEE:  ['Smart Grid', 'Renewable Energy', 'Power Quality', 'Advanced Drives', 'Electives'],
  },
};

// ─── Q-Bank data keyed by subject ─────────────────────────────────────────────

const QBANK_DATA: Record<string, { q: string; type: 'FAQ' | 'PYQ' }[]> = {
  'DSA': [
    { q: 'What is Big-O notation? Explain with examples.', type: 'FAQ' },
    { q: 'Explain Dijkstra\'s algorithm with a worked example.', type: 'PYQ' },
    { q: 'Difference between BFS and DFS with applications?', type: 'FAQ' },
    { q: 'Explain AVL trees and rotations.', type: 'PYQ' },
  ],
  'OOP with Java': [
    { q: 'Explain the four pillars of OOP with real examples.', type: 'FAQ' },
    { q: 'Difference between interface and abstract class in Java?', type: 'PYQ' },
    { q: 'What is method overloading vs overriding?', type: 'FAQ' },
  ],
  'OS': [
    { q: 'What is the difference between process and thread?', type: 'FAQ' },
    { q: 'Explain virtual memory and page replacement algorithms.', type: 'PYQ' },
    { q: 'What is deadlock? State necessary conditions and prevention.', type: 'FAQ' },
    { q: 'Explain CPU scheduling algorithms with examples.', type: 'PYQ' },
  ],
  'DBMS': [
    { q: 'Explain normalisation up to BCNF with examples.', type: 'FAQ' },
    { q: 'Write a SQL query to find the second highest salary.', type: 'PYQ' },
    { q: 'What are ACID properties in transactions?', type: 'FAQ' },
    { q: 'Explain ER diagram with an example.', type: 'PYQ' },
  ],
  'Computer Networks': [
    { q: 'Explain TCP/IP model vs OSI model.', type: 'PYQ' },
    { q: 'What is subnetting? Give an example with CIDR notation.', type: 'FAQ' },
    { q: 'Explain three-way handshake in TCP.', type: 'PYQ' },
  ],
  'Machine Learning': [
    { q: 'Explain bias-variance tradeoff.', type: 'FAQ' },
    { q: 'What is gradient descent? Explain variants.', type: 'PYQ' },
    { q: 'Difference between supervised and unsupervised learning?', type: 'FAQ' },
  ],
  'Deep Learning': [
    { q: 'Explain backpropagation algorithm step by step.', type: 'FAQ' },
    { q: 'What is vanishing gradient problem and solutions?', type: 'PYQ' },
    { q: 'Explain CNN architecture and its applications.', type: 'FAQ' },
  ],
  'Signals & Systems': [
    { q: 'What is Fourier Transform and its applications?', type: 'PYQ' },
    { q: 'Explain Nyquist sampling theorem.', type: 'FAQ' },
    { q: 'What is the difference between LTI and LTV systems?', type: 'PYQ' },
  ],
  'VLSI Design': [
    { q: 'What are CMOS logic gates? Explain the design.', type: 'FAQ' },
    { q: 'What is RTL design methodology?', type: 'PYQ' },
    { q: 'Explain the difference between static and dynamic CMOS.', type: 'FAQ' },
  ],
  'C Programming': [
    { q: 'What is a pointer? Explain with examples.', type: 'FAQ' },
    { q: 'Difference between call by value and call by reference?', type: 'PYQ' },
    { q: 'Explain dynamic memory allocation in C.', type: 'FAQ' },
  ],
  'Python': [
    { q: 'What are Python decorators? Explain with an example.', type: 'FAQ' },
    { q: 'Explain list comprehension vs generator expressions.', type: 'PYQ' },
    { q: 'What is GIL in Python and how does it affect multithreading?', type: 'FAQ' },
  ],
  'Maths': [
    { q: 'Explain Laplace Transform and its applications.', type: 'PYQ' },
    { q: 'What is eigenvalue and eigenvector? Give an example.', type: 'FAQ' },
    { q: 'Explain the concept of linear independence of vectors.', type: 'PYQ' },
  ],
  'Discrete Maths': [
    { q: 'Explain graph theory and its engineering applications.', type: 'FAQ' },
    { q: 'State and prove pigeonhole principle.', type: 'PYQ' },
    { q: 'What is propositional logic? Explain truth tables.', type: 'FAQ' },
  ],
  'Cloud Computing': [
    { q: 'Explain IaaS vs PaaS vs SaaS with examples.', type: 'FAQ' },
    { q: 'What is containerisation? Explain Docker and Kubernetes.', type: 'PYQ' },
    { q: 'What are the CAP theorem trade-offs?', type: 'FAQ' },
  ],
  'Embedded Systems': [
    { q: 'What is RTOS? How does it differ from a general OS?', type: 'FAQ' },
    { q: 'Explain interrupt handling in ARM microcontrollers.', type: 'PYQ' },
    { q: 'What is the difference between microprocessor and microcontroller?', type: 'FAQ' },
  ],
  'Compiler Design': [
    { q: 'Explain the phases of a compiler.', type: 'FAQ' },
    { q: 'What is LL(1) parsing? Give an example.', type: 'PYQ' },
  ],
  'Software Engineering': [
    { q: 'Compare Agile and Waterfall models.', type: 'FAQ' },
    { q: 'What is software testing? Explain types.', type: 'PYQ' },
  ],
  'Information Security': [
    { q: 'Explain RSA encryption with an example.', type: 'PYQ' },
    { q: 'What is SQL injection and how to prevent it?', type: 'FAQ' },
  ],
  'Power Electronics': [
    { q: 'Explain the working of a DC-DC buck converter.', type: 'FAQ' },
    { q: 'What is PWM control in inverters?', type: 'PYQ' },
  ],
  'Control Systems': [
    { q: 'Explain PID controller and its tuning methods.', type: 'FAQ' },
    { q: 'What is Bode plot? How is stability determined?', type: 'PYQ' },
  ],
};

// ─── Courses ──────────────────────────────────────────────────────────────────

const COURSES = [
  { title: 'CS Fundamentals — Data Structures', provider: 'Coursera · UC San Diego', tag: 'DSA', color: '#7C3AED', url: 'https://www.coursera.org/specializations/data-structures-algorithms', years: ['2','3','4'], branches: ['CSE','CSDS','CSBS','ISE','AIML'] },
  { title: 'Machine Learning Specialization', provider: 'Coursera · Andrew Ng', tag: 'ML', color: '#3B82F6', url: 'https://www.coursera.org/specializations/machine-learning-introduction', years: ['3','4'], branches: ['CSDS','AIML','CSE'] },
  { title: 'Full Stack Web Development', provider: 'Udemy · Angela Yu', tag: 'Web', color: '#10B981', url: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/', years: ['2','3','4'], branches: ['CSE','CSBS','ISE','CSDS','AIML'] },
  { title: 'Python for Everybody', provider: 'Coursera · U of Michigan', tag: 'Python', color: '#06B6D4', url: 'https://www.coursera.org/specializations/python', years: ['1','2'], branches: ['CSE','CSDS','CSBS','ISE','AIML','ECE','EEE'] },
  { title: 'Digital Circuits & Systems', provider: 'NPTEL · IIT Madras', tag: 'Core', color: '#F59E0B', url: 'https://nptel.ac.in/courses/117106086', years: ['1','2'], branches: ['ECE','EEE'] },
  { title: 'Operating Systems', provider: 'OSTEP · Free', tag: 'OS', color: '#EC4899', url: 'https://ostep.org', years: ['2','3'], branches: ['CSE','CSDS','CSBS','ISE'] },
  { title: 'Database Management Systems', provider: 'NPTEL · IIT Madras', tag: 'DBMS', color: '#8B5CF6', url: 'https://nptel.ac.in/courses/106106093', years: ['2','3'], branches: ['CSE','CSDS','CSBS','ISE'] },
  { title: 'Engineering Mathematics', provider: 'NPTEL · IIT Roorkee', tag: 'Math', color: '#64748B', url: 'https://nptel.ac.in/courses/111107105', years: ['1','2'], branches: ['CSE','CSDS','CSBS','ISE','ECE','EEE','AIML'] },
  { title: 'Cloud Computing with AWS', provider: 'Coursera · AWS', tag: 'Cloud', color: '#EF4444', url: 'https://www.coursera.org/learn/aws-cloud-technical-essentials', years: ['3','4'], branches: ['CSE','CSDS','ISE','AIML'] },
  { title: 'VLSI Design Fundamentals', provider: 'NPTEL · IIT Madras', tag: 'VLSI', color: '#F59E0B', url: 'https://nptel.ac.in/courses/117106092', years: ['3','4'], branches: ['ECE','EEE'] },
  { title: 'Deep Learning Specialization', provider: 'Coursera · Andrew Ng', tag: 'DL', color: '#3B82F6', url: 'https://www.coursera.org/specializations/deep-learning', years: ['3','4'], branches: ['CSDS','AIML','CSE'] },
  { title: 'Computer Networks', provider: 'Coursera · Stanford', tag: 'Networks', color: '#06B6D4', url: 'https://www.coursera.org/learn/computer-networking', years: ['3','4'], branches: ['CSE','CSDS','ISE'] },
  { title: 'Embedded Systems', provider: 'Coursera · UC Boulder', tag: 'Embedded', color: '#F97316', url: 'https://www.coursera.org/specializations/embedded-systems-software', years: ['3','4'], branches: ['ECE','EEE'] },
];

// ─── LeetCode problems ────────────────────────────────────────────────────────

const LEET_PROBLEMS = [
  { id: 'l1',  title: 'Two Sum',                              difficulty: 'Easy',   tag: 'Arrays',          url: 'https://leetcode.com/problems/two-sum' },
  { id: 'l2',  title: 'Best Time to Buy and Sell Stock',      difficulty: 'Easy',   tag: 'Arrays',          url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock' },
  { id: 'l3',  title: 'Valid Parentheses',                    difficulty: 'Easy',   tag: 'Stack',           url: 'https://leetcode.com/problems/valid-parentheses' },
  { id: 'l4',  title: 'Merge Two Sorted Lists',               difficulty: 'Easy',   tag: 'LinkedList',      url: 'https://leetcode.com/problems/merge-two-sorted-lists' },
  { id: 'l5',  title: 'Binary Search',                        difficulty: 'Easy',   tag: 'Binary Search',   url: 'https://leetcode.com/problems/binary-search' },
  { id: 'l6',  title: 'Climbing Stairs',                      difficulty: 'Easy',   tag: 'DP',              url: 'https://leetcode.com/problems/climbing-stairs' },
  { id: 'l7',  title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', tag: 'Sliding Window', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters' },
  { id: 'l8',  title: 'Container With Most Water',            difficulty: 'Medium', tag: 'Two Pointers',    url: 'https://leetcode.com/problems/container-with-most-water' },
  { id: 'l9',  title: '3Sum',                                 difficulty: 'Medium', tag: 'Two Pointers',    url: 'https://leetcode.com/problems/3sum' },
  { id: 'l10', title: 'Number of Islands',                    difficulty: 'Medium', tag: 'Graphs',          url: 'https://leetcode.com/problems/number-of-islands' },
  { id: 'l11', title: 'Coin Change',                          difficulty: 'Medium', tag: 'DP',              url: 'https://leetcode.com/problems/coin-change' },
  { id: 'l12', title: 'Word Break',                           difficulty: 'Medium', tag: 'DP',              url: 'https://leetcode.com/problems/word-break' },
  { id: 'l13', title: 'Merge Intervals',                      difficulty: 'Medium', tag: 'Arrays',          url: 'https://leetcode.com/problems/merge-intervals' },
  { id: 'l14', title: 'LRU Cache',                            difficulty: 'Medium', tag: 'Design',          url: 'https://leetcode.com/problems/lru-cache' },
  { id: 'l15', title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', tag: 'Binary Search',   url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array' },
  { id: 'l16', title: 'Trapping Rain Water',                  difficulty: 'Hard',   tag: 'Two Pointers',    url: 'https://leetcode.com/problems/trapping-rain-water' },
  { id: 'l17', title: 'Median of Two Sorted Arrays',          difficulty: 'Hard',   tag: 'Binary Search',   url: 'https://leetcode.com/problems/median-of-two-sorted-arrays' },
  { id: 'l18', title: 'Serialize and Deserialize Binary Tree',difficulty: 'Hard',   tag: 'Trees',           url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STREAK_KEY   = 'upskill_streak';
const SOLVED_KEY   = 'upskill_solved';
const LAST_DAY_KEY = 'upskill_lastday';
const GOAL_KEY     = 'upskill_goal';
const TODAY_KEY    = 'upskill_today';

function diffColor(d: string) {
  if (d === 'Easy')   return '#10B981';
  if (d === 'Medium') return '#F59E0B';
  return '#EF4444';
}

const YEARS:    Year[]   = ['1', '2', '3', '4'];
const BRANCHES: Branch[] = ['CSE', 'CSDS', 'CSBS', 'ISE', 'AIML', 'ECE', 'EEE'];
const GOAL_OPTIONS = [1, 2, 3, 5];

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function Upskill() {
  const router = useRouter();

  const [tab, setTab]         = useState<Tab>('courses');
  const [year, setYear]       = useState<Year>('2');
  const [branch, setBranch]   = useState<Branch>('CSE');
  const [selSubj, setSelSubj] = useState('All');
  const [streak, setStreak]   = useState(0);
  const [solved, setSolved]   = useState<Set<string>>(new Set());
  const [dailyGoal, setDailyGoal] = useState(2);
  const [todaySolved, setTodaySolved] = useState(0);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState(2);
  const [goalSet, setGoalSet] = useState(false);

  useEffect(() => {
    (async () => {
      const s   = await AsyncStorage.getItem(STREAK_KEY);
      const sv  = await AsyncStorage.getItem(SOLVED_KEY);
      const g   = await AsyncStorage.getItem(GOAL_KEY);
      const td  = await AsyncStorage.getItem(TODAY_KEY);
      const ld  = await AsyncStorage.getItem(LAST_DAY_KEY);
      const today = new Date().toDateString();

      if (s)  setStreak(parseInt(s));
      if (sv) setSolved(new Set(JSON.parse(sv)));
      if (g)  { setDailyGoal(parseInt(g)); setGoalSet(true); setGoalInput(parseInt(g)); }
      else    setShowGoalModal(true);

      // Reset today's count if it's a new day
      if (ld !== today) {
        setTodaySolved(0);
        await AsyncStorage.setItem(TODAY_KEY, '0');
        await AsyncStorage.setItem(LAST_DAY_KEY, today);
      } else if (td) {
        setTodaySolved(parseInt(td));
      }
    })();
  }, []);

  const saveGoal = async () => {
    setDailyGoal(goalInput);
    setGoalSet(true);
    setShowGoalModal(false);
    await AsyncStorage.setItem(GOAL_KEY, String(goalInput));
  };

  const markSolved = async (id: string) => {
    const newSolved = new Set(solved);
    let newTodaySolved = todaySolved;

    if (newSolved.has(id)) {
      newSolved.delete(id);
      newTodaySolved = Math.max(0, newTodaySolved - 1);
    } else {
      newSolved.add(id);
      newTodaySolved += 1;
      // Streak increments when daily goal is hit for the first time today
      if (newTodaySolved === dailyGoal) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        await AsyncStorage.setItem(STREAK_KEY, String(newStreak));
      }
    }
    setSolved(newSolved);
    setTodaySolved(newTodaySolved);
    await AsyncStorage.setItem(SOLVED_KEY, JSON.stringify([...newSolved]));
    await AsyncStorage.setItem(TODAY_KEY, String(newTodaySolved));
  };

  // Subjects for current year/branch
  const currentSubjects: string[] = SUBJECT_MAP[year]?.[branch] ?? [];

  // Q-Bank subjects that have data
  const availableSubjects = currentSubjects.filter(s =>
    Object.keys(QBANK_DATA).some(k =>
      k === s || k.startsWith(s.split(' ')[0]) || s.startsWith(k.split(' ')[0])
    )
  );

  // Q-Bank questions filtered by subject
  const getQBankItems = () => {
    const matchKey = (s: string, k: string) =>
      k === s || k.startsWith(s.split(' ')[0]) || s.startsWith(k.split(' ')[0]);

    const items: { q: string; type: 'FAQ' | 'PYQ'; subject: string }[] = [];
    const subjectsToShow = selSubj === 'All' ? currentSubjects : [selSubj];

    subjectsToShow.forEach(s => {
      Object.entries(QBANK_DATA).forEach(([k, qs]) => {
        if (matchKey(s, k)) {
          qs.forEach(q => items.push({ ...q, subject: k }));
        }
      });
    });

    // Dedupe
    const seen = new Set<string>();
    return items.filter(q => { if (seen.has(q.q)) return false; seen.add(q.q); return true; });
  };

  const filteredCourses = COURSES.filter(c =>
    c.years.includes(year) && c.branches.includes(branch)
  );

  const pct = Math.min(100, Math.round((todaySolved / dailyGoal) * 100));
  const goalMet = todaySolved >= dailyGoal;

  return (
    <View style={styles.root}>

      {/* ── Goal Modal ── */}
      <Modal visible={showGoalModal} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalBg}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Set your daily goal</Text>
            <Text style={styles.modalSub}>
              How many LeetCode problems do you want to solve each day?
              Your streak only counts once you hit this goal.
            </Text>
            <View style={styles.goalRow}>
              {GOAL_OPTIONS.map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.goalChip, goalInput === n && styles.goalChipSel]}
                  onPress={() => setGoalInput(n)}
                >
                  <Text style={[styles.goalChipText, goalInput === n && styles.goalChipTextSel]}>
                    {n}/day
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.goalBtn} onPress={saveGoal}>
              <Text style={styles.goalBtnText}>Start Tracking ⚡</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upskill</Text>
        <TouchableOpacity
          style={styles.streakBadge}
          onPress={() => { if (tab === 'leetcode') setShowGoalModal(true); }}
        >
          <Text style={styles.streakFire}>⚡</Text>
          <Text style={styles.streakCount}>{streak}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Year filter ── */}
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>YEAR</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {YEARS.map((y) => (
            <TouchableOpacity
              key={y}
              style={[styles.chip, year === y && styles.chipOn]}
              onPress={() => { setYear(y); setSelSubj('All'); }}
            >
              <Text style={[styles.chipText, year === y && styles.chipTextOn]}>Year {y}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Branch filter ── */}
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>BRANCH</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {BRANCHES.map((b) => (
            <TouchableOpacity
              key={b}
              style={[styles.chip, branch === b && styles.chipOn]}
              onPress={() => { setBranch(b); setSelSubj('All'); }}
            >
              <Text style={[styles.chipText, branch === b && styles.chipTextOn]}>{b}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.divider} />

      {/* ── Tab bar ── */}
      <View style={styles.tabBar}>
        {([
          { key: 'courses',  label: '📚  Courses' },
          { key: 'leetcode', label: '💻  LeetCode' },
          { key: 'qbank',    label: '❓  Q-Bank' },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tabBtn, tab === key && styles.tabBtnOn]}
            onPress={() => { setTab(key); setSelSubj('All'); }}
          >
            <Text style={[styles.tabBtnText, tab === key && styles.tabBtnTextOn]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Subject filter — Q-Bank only ── */}
      {tab === 'qbank' && (
        <View style={styles.subjectWrap}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>SUBJECT</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {['All', ...availableSubjects].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, selSubj === s && styles.chipOn]}
                  onPress={() => setSelSubj(s)}
                >
                  <Text style={[styles.chipText, selSubj === s && styles.chipTextOn]}
                    numberOfLines={1}
                  >
                    {s.length > 12 ? s.slice(0, 11) + '…' : s}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.divider} />
        </View>
      )}

      {/* ── Content ── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>

        {/* COURSES */}
        {tab === 'courses' && (
          filteredCourses.length === 0
            ? <Text style={styles.empty}>No courses for Year {year} · {branch}</Text>
            : filteredCourses.map((c, i) => (
              <View key={i} style={[styles.courseCard, { borderLeftColor: c.color }]}>
                <View style={styles.courseTop}>
                  <View style={[styles.tagPill, { backgroundColor: c.color + '22' }]}>
                    <Text style={[styles.tagText, { color: c.color }]}>{c.tag}</Text>
                  </View>
                  <Text style={styles.provider}>{c.provider}</Text>
                </View>
                <Text style={styles.courseTitle}>{c.title}</Text>
                <TouchableOpacity
                  style={[styles.courseBtn, { backgroundColor: c.color + '22', borderColor: c.color + '55' }]}
                  onPress={() => Linking.openURL(c.url)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.courseBtnText, { color: c.color }]}>View Course →</Text>
                </TouchableOpacity>
              </View>
            ))
        )}

        {/* LEETCODE */}
        {tab === 'leetcode' && (
          <>
            {/* Streak card */}
            <View style={styles.streakCard}>
              <View style={styles.streakTop}>
                <View style={styles.streakLeft}>
                  <Text style={styles.streakEmoji}>⚡</Text>
                  <View>
                    <Text style={styles.streakNum}>{streak} day streak</Text>
                    <Text style={styles.streakGoalText}>Goal: {dailyGoal} problems/day</Text>
                  </View>
                </View>
                <Text style={styles.streakSolved}>{solved.size}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, {
                  width: `${pct}%` as any,
                  backgroundColor: goalMet ? '#10B981' : '#7C3AED',
                }]} />
              </View>
              <View style={styles.streakBottom}>
                <Text style={styles.streakProgress}>
                  {todaySolved}/{dailyGoal} today{goalMet ? '  ·  Streak updated! ✓' : ''}
                </Text>
                <TouchableOpacity onPress={() => setShowGoalModal(true)}>
                  <Text style={styles.changeGoal}>Change goal</Text>
                </TouchableOpacity>
              </View>
            </View>

            {LEET_PROBLEMS.map((p) => (
              <View key={p.id} style={[styles.leetCard, solved.has(p.id) && styles.leetCardDone]}>
                <View style={styles.leetLeft}>
                  <TouchableOpacity
                    style={[styles.checkbox, solved.has(p.id) && styles.checkboxDone]}
                    onPress={() => markSolved(p.id)}
                  >
                    {solved.has(p.id) && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.leetTitle, solved.has(p.id) && styles.leetTitleDone]}
                      numberOfLines={2}
                    >
                      {p.title}
                    </Text>
                    <View style={styles.leetMeta}>
                      <Text style={[styles.leetDiff, { color: diffColor(p.difficulty) }]}>{p.difficulty}</Text>
                      <Text style={styles.leetTag}>{p.tag}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => Linking.openURL(p.url)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.leetArrow}>→</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Q-BANK */}
        {tab === 'qbank' && (() => {
          const items = getQBankItems();
          return items.length === 0
            ? <Text style={styles.empty}>No questions for this selection</Text>
            : items.map((q, i) => (
              <View key={i} style={styles.qCard}>
                <View style={styles.qTop}>
                  <View style={[styles.tagPill, {
                    backgroundColor: q.type === 'PYQ' ? 'rgba(124,58,237,0.15)' : 'rgba(16,185,129,0.15)',
                  }]}>
                    <Text style={[styles.tagText, { color: q.type === 'PYQ' ? '#7C3AED' : '#10B981' }]}>
                      {q.type}
                    </Text>
                  </View>
                  <Text style={styles.qSubject}>{q.subject}</Text>
                </View>
                <Text style={styles.qText}>{q.q}</Text>
              </View>
            ));
        })()}

      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D1A' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 14,
  },
  back: { fontSize: 22, color: '#F8FAFC', width: 32 },
  headerTitle: { fontFamily: 'Georgia', fontSize: 20, color: '#FFFFFF', flex: 1, textAlign: 'center' },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(124,58,237,0.2)', borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.4)',
  },
  streakFire: { fontSize: 13 },
  streakCount: { color: '#A78BFA', fontSize: 13, fontWeight: '700' },

  filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 8 },
  filterLabel: { fontSize: 10, color: '#475569', letterSpacing: 1, minWidth: 52 },
  chips: { gap: 6, paddingRight: 4 },
  chip: {
    paddingHorizontal: 13, paddingVertical: 5, borderRadius: 999,
    backgroundColor: '#1A1A2E', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  chipOn: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  chipText: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  chipTextOn: { color: '#FFFFFF', fontWeight: '600' },

  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 20, marginBottom: 10 },

  tabBar: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 10,
    backgroundColor: '#1A1A2E', borderRadius: 12, padding: 3,
  },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  tabBtnOn: { backgroundColor: '#7C3AED' },
  tabBtnText: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  tabBtnTextOn: { color: '#FFFFFF', fontWeight: '600' },

  subjectWrap: { marginBottom: 2 },

  list: { paddingHorizontal: 20, paddingBottom: 100, gap: 10 },
  empty: { color: '#475569', fontSize: 13, textAlign: 'center', marginTop: 40 },

  // Course
  courseCard: {
    backgroundColor: '#1A1A2E', borderRadius: 14, padding: 14,
    borderLeftWidth: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  courseTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  tagPill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5 },
  tagText: { fontSize: 9, fontWeight: '700' },
  provider: { fontSize: 11, color: '#64748B', flex: 1 },
  courseTitle: { fontSize: 14, color: '#FFFFFF', fontWeight: '600', marginBottom: 12 },
  courseBtn: {
    paddingVertical: 7, paddingHorizontal: 12, borderRadius: 8,
    borderWidth: 1, alignSelf: 'flex-start',
  },
  courseBtnText: { fontSize: 12, fontWeight: '600' },

  // Streak
  streakCard: {
    backgroundColor: '#1A1A2E', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)',
  },
  streakTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  streakLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  streakEmoji: { fontSize: 22 },
  streakNum: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  streakGoalText: { color: '#64748B', fontSize: 10, marginTop: 2 },
  streakSolved: { color: '#A78BFA', fontSize: 22, fontWeight: '700', fontFamily: 'Georgia' },
  progressTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 5, borderRadius: 3 },
  streakBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  streakProgress: { fontSize: 10, color: '#64748B' },
  changeGoal: { fontSize: 10, color: '#7C3AED', fontWeight: '600' },

  // LeetCode
  leetCard: {
    backgroundColor: '#1A1A2E', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  leetCardDone: { opacity: 0.55 },
  leetLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1 },
  checkbox: {
    width: 20, height: 20, borderRadius: 5, borderWidth: 2,
    borderColor: '#334155', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, marginTop: 1,
  },
  checkboxDone: { backgroundColor: '#10B981', borderColor: '#10B981' },
  checkmark: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  leetTitle: { fontSize: 13, color: '#FFFFFF', marginBottom: 5 },
  leetTitleDone: { textDecorationLine: 'line-through', color: '#64748B' },
  leetMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  leetDiff: { fontSize: 10, fontWeight: '700' },
  leetTag: {
    fontSize: 10, color: '#475569',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  leetArrow: { fontSize: 16, color: '#7C3AED', fontWeight: '700', paddingLeft: 8 },

  // Q-Bank
  qCard: {
    backgroundColor: '#1A1A2E', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  qTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  qSubject: { fontSize: 11, color: '#64748B' },
  qText: { fontSize: 13, color: '#FFFFFF', lineHeight: 21 },

  // Goal modal
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#1A1A2E', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalTitle: { fontFamily: 'Georgia', fontSize: 20, color: '#FFFFFF', marginBottom: 8 },
  modalSub: { fontSize: 13, color: '#64748B', marginBottom: 20, lineHeight: 20 },
  goalRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  goalChip: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#0D0D1A', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  goalChipSel: { borderColor: '#7C3AED', backgroundColor: 'rgba(124,58,237,0.1)' },
  goalChipText: { color: '#64748B', fontSize: 13 },
  goalChipTextSel: { color: '#A78BFA', fontWeight: '600' },
  goalBtn: {
    backgroundColor: '#7C3AED', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  goalBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
