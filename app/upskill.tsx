import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Linking, Modal,
  KeyboardAvoidingView, Platform, Animated, StatusBar,
  LayoutAnimation, UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: W } = Dimensions.get('window');

type Year   = '1' | '2' | '3' | '4';
type Branch = 'CSE' | 'CSDS' | 'CSBS' | 'ISE' | 'AIML' | 'ECE' | 'EEE';
type Tab    = 'courses' | 'leetcode' | 'qbank';

// ─── Data ─────────────────────────────────────────────────────────────────────

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

const QBANK_DATA: Record<string, { q: string; type: 'FAQ' | 'PYQ' }[]> = {
  'DSA': [
    { q: 'What is Big-O notation? Explain with examples.', type: 'FAQ' },
    { q: "Explain Dijkstra's algorithm with a worked example.", type: 'PYQ' },
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

const COURSES = [
  { title: 'CS Fundamentals — Data Structures',       provider: 'Coursera · UC San Diego',  tag: 'DSA',      color: '#7C3AED', url: 'https://www.coursera.org/specializations/data-structures-algorithms',          years: ['2','3','4'], branches: ['CSE','CSDS','CSBS','ISE','AIML'] },
  { title: 'Machine Learning Specialization',          provider: 'Coursera · Andrew Ng',     tag: 'ML',       color: '#3B82F6', url: 'https://www.coursera.org/specializations/machine-learning-introduction',      years: ['3','4'],     branches: ['CSDS','AIML','CSE'] },
  { title: 'Full Stack Web Development',               provider: 'Udemy · Angela Yu',        tag: 'Web',      color: '#10B981', url: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/',         years: ['2','3','4'], branches: ['CSE','CSBS','ISE','CSDS','AIML'] },
  { title: 'Python for Everybody',                     provider: 'Coursera · U of Michigan', tag: 'Python',   color: '#06B6D4', url: 'https://www.coursera.org/specializations/python',                             years: ['1','2'],     branches: ['CSE','CSDS','CSBS','ISE','AIML','ECE','EEE'] },
  { title: 'Digital Circuits & Systems',               provider: 'NPTEL · IIT Madras',       tag: 'Core',     color: '#F59E0B', url: 'https://nptel.ac.in/courses/117106086',                                       years: ['1','2'],     branches: ['ECE','EEE'] },
  { title: 'Operating Systems',                        provider: 'OSTEP · Free',             tag: 'OS',       color: '#EC4899', url: 'https://ostep.org',                                                           years: ['2','3'],     branches: ['CSE','CSDS','CSBS','ISE'] },
  { title: 'Database Management Systems',              provider: 'NPTEL · IIT Madras',       tag: 'DBMS',     color: '#8B5CF6', url: 'https://nptel.ac.in/courses/106106093',                                       years: ['2','3'],     branches: ['CSE','CSDS','CSBS','ISE'] },
  { title: 'Engineering Mathematics',                  provider: 'NPTEL · IIT Roorkee',      tag: 'Math',     color: '#64748B', url: 'https://nptel.ac.in/courses/111107105',                                       years: ['1','2'],     branches: ['CSE','CSDS','CSBS','ISE','ECE','EEE','AIML'] },
  { title: 'Cloud Computing with AWS',                 provider: 'Coursera · AWS',           tag: 'Cloud',    color: '#EF4444', url: 'https://www.coursera.org/learn/aws-cloud-technical-essentials',               years: ['3','4'],     branches: ['CSE','CSDS','ISE','AIML'] },
  { title: 'VLSI Design Fundamentals',                 provider: 'NPTEL · IIT Madras',       tag: 'VLSI',     color: '#F59E0B', url: 'https://nptel.ac.in/courses/117106092',                                       years: ['3','4'],     branches: ['ECE','EEE'] },
  { title: 'Deep Learning Specialization',             provider: 'Coursera · Andrew Ng',     tag: 'DL',       color: '#3B82F6', url: 'https://www.coursera.org/specializations/deep-learning',                      years: ['3','4'],     branches: ['CSDS','AIML','CSE'] },
  { title: 'Computer Networks',                        provider: 'Coursera · Stanford',      tag: 'Networks', color: '#06B6D4', url: 'https://www.coursera.org/learn/computer-networking',                          years: ['3','4'],     branches: ['CSE','CSDS','ISE'] },
  { title: 'Embedded Systems',                         provider: 'Coursera · UC Boulder',    tag: 'Embedded', color: '#F97316', url: 'https://www.coursera.org/specializations/embedded-systems-software',          years: ['3','4'],     branches: ['ECE','EEE'] },
];

const LEET_PROBLEMS = [
  { id: 'l1',  title: 'Two Sum',                                       difficulty: 'Easy',   tag: 'Arrays',         url: 'https://leetcode.com/problems/two-sum' },
  { id: 'l2',  title: 'Best Time to Buy and Sell Stock',               difficulty: 'Easy',   tag: 'Arrays',         url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock' },
  { id: 'l3',  title: 'Valid Parentheses',                             difficulty: 'Easy',   tag: 'Stack',          url: 'https://leetcode.com/problems/valid-parentheses' },
  { id: 'l4',  title: 'Merge Two Sorted Lists',                        difficulty: 'Easy',   tag: 'LinkedList',     url: 'https://leetcode.com/problems/merge-two-sorted-lists' },
  { id: 'l5',  title: 'Binary Search',                                 difficulty: 'Easy',   tag: 'Binary Search',  url: 'https://leetcode.com/problems/binary-search' },
  { id: 'l6',  title: 'Climbing Stairs',                               difficulty: 'Easy',   tag: 'DP',             url: 'https://leetcode.com/problems/climbing-stairs' },
  { id: 'l7',  title: 'Longest Substring Without Repeating Characters',difficulty: 'Medium', tag: 'Sliding Window', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters' },
  { id: 'l8',  title: 'Container With Most Water',                     difficulty: 'Medium', tag: 'Two Pointers',   url: 'https://leetcode.com/problems/container-with-most-water' },
  { id: 'l9',  title: '3Sum',                                          difficulty: 'Medium', tag: 'Two Pointers',   url: 'https://leetcode.com/problems/3sum' },
  { id: 'l10', title: 'Number of Islands',                             difficulty: 'Medium', tag: 'Graphs',         url: 'https://leetcode.com/problems/number-of-islands' },
  { id: 'l11', title: 'Coin Change',                                   difficulty: 'Medium', tag: 'DP',             url: 'https://leetcode.com/problems/coin-change' },
  { id: 'l12', title: 'Word Break',                                    difficulty: 'Medium', tag: 'DP',             url: 'https://leetcode.com/problems/word-break' },
  { id: 'l13', title: 'Merge Intervals',                               difficulty: 'Medium', tag: 'Arrays',         url: 'https://leetcode.com/problems/merge-intervals' },
  { id: 'l14', title: 'LRU Cache',                                     difficulty: 'Medium', tag: 'Design',         url: 'https://leetcode.com/problems/lru-cache' },
  { id: 'l15', title: 'Find Minimum in Rotated Sorted Array',          difficulty: 'Medium', tag: 'Binary Search',  url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array' },
  { id: 'l16', title: 'Trapping Rain Water',                           difficulty: 'Hard',   tag: 'Two Pointers',   url: 'https://leetcode.com/problems/trapping-rain-water' },
  { id: 'l17', title: 'Median of Two Sorted Arrays',                   difficulty: 'Hard',   tag: 'Binary Search',  url: 'https://leetcode.com/problems/median-of-two-sorted-arrays' },
  { id: 'l18', title: 'Serialize and Deserialize Binary Tree',         difficulty: 'Hard',   tag: 'Trees',          url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree' },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const STREAK_KEY   = 'upskill_streak';
const SOLVED_KEY   = 'upskill_solved';
const LAST_DAY_KEY = 'upskill_lastday';
const GOAL_KEY     = 'upskill_goal';
const TODAY_KEY    = 'upskill_today';

const YEARS:       Year[]   = ['1', '2', '3', '4'];
const BRANCHES:    Branch[] = ['CSE', 'CSDS', 'CSBS', 'ISE', 'AIML', 'ECE', 'EEE'];
const GOAL_OPTIONS          = [1, 2, 3, 5];

const TAB_ITEMS: { key: Tab; label: string; icon: string }[] = [
  { key: 'courses',  label: 'Courses',  icon: '📚' },
  { key: 'leetcode', label: 'LeetCode', icon: '💻' },
  { key: 'qbank',    label: 'Q-Bank',   icon: '❓' },
];

const OUTER   = 20;
const TB_PAD  = 3;
const TAB_W   = (W - OUTER * 2 - TB_PAD * 2) / 3;

function diffColor(d: string) {
  if (d === 'Easy')   return '#10B981';
  if (d === 'Medium') return '#F59E0B';
  return '#EF4444';
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Upskill() {
  const router = useRouter();

  const [tab,          setTab]          = useState<Tab>('courses');
  const [year,         setYear]         = useState<Year>('2');
  const [branch,       setBranch]       = useState<Branch>('CSE');
  const [selSubj,      setSelSubj]      = useState('All');
  const [streak,       setStreak]       = useState(0);
  const [solved,       setSolved]       = useState<Set<string>>(new Set());
  const [dailyGoal,    setDailyGoal]    = useState(2);
  const [todaySolved,  setTodaySolved]  = useState(0);
  const [showGoalModal,setShowGoalModal]= useState(false);
  const [goalInput,    setGoalInput]    = useState(2);
  const [expandedQ,    setExpandedQ]    = useState<Set<number>>(new Set());

  const tabAnim   = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const leetAnims = useRef(LEET_PROBLEMS.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    (async () => {
      const [s, sv, g, td, ld] = await Promise.all([
        AsyncStorage.getItem(STREAK_KEY),
        AsyncStorage.getItem(SOLVED_KEY),
        AsyncStorage.getItem(GOAL_KEY),
        AsyncStorage.getItem(TODAY_KEY),
        AsyncStorage.getItem(LAST_DAY_KEY),
      ]);
      const today = new Date().toDateString();

      if (s)  setStreak(+s);
      if (sv) setSolved(new Set(JSON.parse(sv)));
      if (g)  { setDailyGoal(+g); setGoalInput(+g); }
      else    setShowGoalModal(true);

      if (ld !== today) {
        setTodaySolved(0);
        await Promise.all([
          AsyncStorage.setItem(TODAY_KEY,    '0'),
          AsyncStorage.setItem(LAST_DAY_KEY, today),
        ]);
      } else if (td) {
        setTodaySolved(+td);
      }
    })();
  }, []);

  const switchTab = useCallback((newTab: Tab) => {
    if (newTab === tab) return;
    const idx = TAB_ITEMS.findIndex(t => t.key === newTab);

    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 8, duration: 80,  useNativeDriver: true }),
    ]).start(() => {
      setTab(newTab);
      setSelSubj('All');
      slideAnim.setValue(-8);
      Animated.spring(tabAnim, { toValue: idx, speed: 20, bounciness: 6, useNativeDriver: true }).start();
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, speed: 22, bounciness: 2, useNativeDriver: true }),
      ]).start();
    });
  }, [tab]);

  const saveGoal = async () => {
    setDailyGoal(goalInput);
    setShowGoalModal(false);
    await AsyncStorage.setItem(GOAL_KEY, String(goalInput));
  };

  const markSolved = async (id: string, idx: number) => {
    Animated.sequence([
      Animated.spring(leetAnims[idx], { toValue: 0.8,  speed: 50, bounciness: 0,  useNativeDriver: true }),
      Animated.spring(leetAnims[idx], { toValue: 1,    speed: 18, bounciness: 10, useNativeDriver: true }),
    ]).start();

    const ns  = new Set(solved);
    let   nts = todaySolved;

    if (ns.has(id)) {
      ns.delete(id);
      nts = Math.max(0, nts - 1);
    } else {
      ns.add(id);
      nts += 1;
      if (nts === dailyGoal) {
        const nst = streak + 1;
        setStreak(nst);
        await AsyncStorage.setItem(STREAK_KEY, String(nst));
      }
    }
    setSolved(ns);
    setTodaySolved(nts);
    await Promise.all([
      AsyncStorage.setItem(SOLVED_KEY, JSON.stringify([...ns])),
      AsyncStorage.setItem(TODAY_KEY,  String(nts)),
    ]);
  };

  const toggleQ = (i: number) => {
    LayoutAnimation.configureNext({
      duration: 240,
      update: { type: LayoutAnimation.Types.easeInEaseOut },
    });
    setExpandedQ(prev => {
      const nx = new Set(prev);
      nx.has(i) ? nx.delete(i) : nx.add(i);
      return nx;
    });
  };

  const currentSubjects   = SUBJECT_MAP[year]?.[branch] ?? [];
  const availableSubjects = currentSubjects.filter(sub =>
    Object.keys(QBANK_DATA).some(k =>
      k === sub || k.startsWith(sub.split(' ')[0]) || sub.startsWith(k.split(' ')[0])
    )
  );

  const getQBankItems = () => {
    const mk = (sub: string, k: string) =>
      k === sub || k.startsWith(sub.split(' ')[0]) || sub.startsWith(k.split(' ')[0]);
    const out: { q: string; type: 'FAQ' | 'PYQ'; subject: string }[] = [];
    (selSubj === 'All' ? currentSubjects : [selSubj]).forEach(sub =>
      Object.entries(QBANK_DATA).forEach(([k, qs]) => {
        if (mk(sub, k)) qs.forEach(q => out.push({ ...q, subject: k }));
      })
    );
    const seen = new Set<string>();
    return out.filter(q => { if (seen.has(q.q)) return false; seen.add(q.q); return true; });
  };

  const filteredCourses = COURSES.filter(c => c.years.includes(year) && c.branches.includes(branch));
  const goalMet         = todaySolved >= dailyGoal;

  const indicatorX = tabAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [TB_PAD, TB_PAD + TAB_W, TB_PAD + TAB_W * 2],
  });

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />

      {/* Goal Modal */}
      <Modal visible={showGoalModal} transparent animationType="slide">
        <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.modalSheet}>
            <View style={s.sheetHandle} />
            <Text style={s.modalTitle}>Daily Goal</Text>
            <Text style={s.modalBody}>
              How many LeetCode problems per day?{'\n'}Your streak only increments when you hit this.
            </Text>
            <View style={s.goalRow}>
              {GOAL_OPTIONS.map(n => (
                <TouchableOpacity
                  key={n}
                  style={[s.goalChip, goalInput === n && s.goalChipOn]}
                  onPress={() => setGoalInput(n)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.goalNum, goalInput === n && s.goalNumOn]}>{n}</Text>
                  <Text style={[s.goalDay, goalInput === n && s.goalDayOn]}>/day</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={s.startBtn} onPress={saveGoal} activeOpacity={0.88}>
              <Text style={s.startBtnTxt}>⚡  Start Tracking</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>
        <Text style={s.pageTitle}>Upskill</Text>
        <TouchableOpacity
          style={[s.streakPill, goalMet && s.streakPillGold]}
          onPress={() => setShowGoalModal(true)}
          activeOpacity={0.8}
        >
          <Text style={s.streakIcon}>⚡</Text>
          <Text style={[s.streakNum, goalMet && s.streakNumGold]}>{streak}</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={s.filterBlock}>
        <FilterRow label="YEAR">
          {YEARS.map(y => (
            <Chip key={y} label={`Year ${y}`} active={year === y}
              onPress={() => { setYear(y); setSelSubj('All'); }} />
          ))}
        </FilterRow>
        <FilterRow label="BRANCH">
          {BRANCHES.map(b => (
            <Chip key={b} label={b} active={branch === b}
              onPress={() => { setBranch(b); setSelSubj('All'); }} />
          ))}
        </FilterRow>
      </View>

      {/* Tab Bar */}
      <View style={s.tabBar}>
        <Animated.View style={[s.tabIndicator, { transform: [{ translateX: indicatorX }], width: TAB_W }]} />
        {TAB_ITEMS.map(item => {
          const on = tab === item.key;
          return (
            <TouchableOpacity key={item.key} style={s.tabBtn} onPress={() => switchTab(item.key)} activeOpacity={0.75}>
              <Text style={[s.tabIcon, on && s.tabIconOn]}>{item.icon}</Text>
              <Text style={[s.tabLabel, on && s.tabLabelOn]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Subject filter — Q-Bank only */}
      {tab === 'qbank' && (
        <View style={s.subjBar}>
          <FilterRow label="SUBJECT">
            {['All', ...availableSubjects].map(sub => (
              <Chip
                key={sub}
                label={sub.length > 13 ? sub.slice(0, 12) + '…' : sub}
                active={selSubj === sub}
                onPress={() => setSelSubj(sub)}
              />
            ))}
          </FilterRow>
        </View>
      )}

      {/* Animated content area */}
      <Animated.ScrollView
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >

        {/* ── COURSES ── */}
        {tab === 'courses' && (
          filteredCourses.length === 0
            ? <Empty icon="🎓" text={`No courses for Year ${year} · ${branch}`} hint="Try a different year or branch" />
            : <>
                <Text style={s.metaLine}>
                  {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} · Year {year} · {branch}
                </Text>
                {filteredCourses.map((c, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[s.courseCard, { borderLeftColor: c.color }]}
                    onPress={() => Linking.openURL(c.url)}
                    activeOpacity={0.82}
                  >
                    <View style={[s.courseGlow, { backgroundColor: c.color + '0F' }]} />
                    <View style={s.courseInner}>
                      <View style={s.courseTopRow}>
                        <View style={[s.badge, { backgroundColor: c.color + '28' }]}>
                          <Text style={[s.badgeTxt, { color: c.color }]}>{c.tag}</Text>
                        </View>
                        <Text style={s.providerTxt} numberOfLines={1}>{c.provider}</Text>
                        <Text style={[s.openArr, { color: c.color }]}>↗</Text>
                      </View>
                      <Text style={s.courseTitle}>{c.title}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
        )}

        {/* ── LEETCODE ── */}
        {tab === 'leetcode' && (
          <>
            {/* Streak card */}
            <View style={s.streakCard}>
              <View style={s.streakCardBody}>
                {/* Left — streak */}
                <View style={s.streakLeft}>
                  <Text style={s.streakBigNum}>{streak}</Text>
                  <Text style={s.streakDayLbl}>day streak</Text>
                  <View style={s.streakPillSmall}>
                    <Text style={s.streakGoalInfo}>Goal · {dailyGoal}/day</Text>
                  </View>
                </View>

                <View style={s.vDivider} />

                {/* Right — today's progress */}
                <View style={s.streakRight}>
                  <Text style={s.solvedBig}>{solved.size}</Text>
                  <Text style={s.solvedLbl}>total solved</Text>
                  <View style={s.dotRow}>
                    {Array.from({ length: dailyGoal }).map((_, di) => (
                      <View
                        key={di}
                        style={[
                          s.dot,
                          di < todaySolved && (goalMet ? s.dotGold : s.dotViolet),
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[s.todayTxt, goalMet && s.todayTxtGold]}>
                    {todaySolved}/{dailyGoal} today{goalMet ? ' ✓' : ''}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={s.editGoalRow} onPress={() => setShowGoalModal(true)}>
                <Text style={s.editGoalTxt}>Edit daily goal →</Text>
              </TouchableOpacity>
            </View>

            {/* Problems */}
            {LEET_PROBLEMS.map((p, i) => {
              const done = solved.has(p.id);
              const dc   = diffColor(p.difficulty);
              return (
                <View key={p.id} style={[s.leetCard, done && s.leetCardDone]}>
                  <Animated.View style={{ transform: [{ scale: leetAnims[i] }] }}>
                    <TouchableOpacity
                      style={[s.chk, done && s.chkDone]}
                      onPress={() => markSolved(p.id, i)}
                      activeOpacity={0.75}
                    >
                      {done && <Text style={s.chkMark}>✓</Text>}
                    </TouchableOpacity>
                  </Animated.View>

                  <View style={s.leetMid}>
                    <Text style={[s.leetTitle, done && s.leetTitleDone]} numberOfLines={2}>
                      {p.title}
                    </Text>
                    <View style={s.leetTagRow}>
                      <View style={[s.diffPill, { backgroundColor: dc + '22' }]}>
                        <Text style={[s.diffTxt, { color: dc }]}>{p.difficulty}</Text>
                      </View>
                      <Text style={s.topicTxt}>{p.tag}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => Linking.openURL(p.url)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={s.leetArr}>→</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        )}

        {/* ── Q-BANK ── */}
        {tab === 'qbank' && (() => {
          const items = getQBankItems();
          if (items.length === 0)
            return <Empty icon="📖" text="No questions for this selection" hint="Try selecting a different subject" />;

          return (
            <>
              <Text style={s.metaLine}>{items.length} question{items.length !== 1 ? 's' : ''}</Text>
              {items.map((q, i) => {
                const expanded = expandedQ.has(i);
                const isPYQ    = q.type === 'PYQ';
                return (
                  <TouchableOpacity
                    key={i}
                    style={[s.qCard, expanded && s.qCardExpanded]}
                    onPress={() => toggleQ(i)}
                    activeOpacity={0.88}
                  >
                    <View style={s.qCardTop}>
                      <View style={[s.qBadge, isPYQ ? s.qBadgePYQ : s.qBadgeFAQ]}>
                        <Text style={[s.qBadgeTxt, isPYQ ? s.qBadgeTxtPYQ : s.qBadgeTxtFAQ]}>
                          {q.type}
                        </Text>
                      </View>
                      <Text style={s.qSubj} numberOfLines={1}>{q.subject}</Text>
                      <Text style={s.qChevron}>{expanded ? '▲' : '▼'}</Text>
                    </View>
                    <Text style={[s.qTxt, expanded && s.qTxtExpanded]} numberOfLines={expanded ? undefined : 2}>
                      {q.q}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </>
          );
        })()}

      </Animated.ScrollView>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.filterRow}>
      <Text style={s.filterLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
        {children}
      </ScrollView>
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[s.chip, active && s.chipOn]} onPress={onPress} activeOpacity={0.8}>
      <Text style={[s.chipTxt, active && s.chipTxtOn]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Empty({ icon, text, hint }: { icon: string; text: string; hint: string }) {
  return (
    <View style={s.emptyBox}>
      <Text style={s.emptyIcon}>{icon}</Text>
      <Text style={s.emptyTxt}>{text}</Text>
      <Text style={s.emptyHint}>{hint}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D1A' },

  // ── Modal ──────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 44,
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Georgia', fontSize: 22, color: '#FFFFFF', marginBottom: 8,
  },
  modalBody: {
    fontSize: 13, color: '#94A3B8', lineHeight: 20, marginBottom: 24,
  },
  goalRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  goalChip: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: '#0D0D1A',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  goalChipOn: { borderColor: '#7C3AED', backgroundColor: 'rgba(124,58,237,0.12)' },
  goalNum:    { fontSize: 20, fontWeight: '700', color: '#475569' },
  goalNumOn:  { color: '#A78BFA' },
  goalDay:    { fontSize: 11, color: '#475569', marginTop: 2 },
  goalDayOn:  { color: '#7C3AED' },
  startBtn: {
    backgroundColor: '#7C3AED', borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
  },
  startBtnTxt: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 54, paddingHorizontal: OUTER, paddingBottom: 14,
  },
  backBtn:  { width: 34, alignItems: 'flex-start' },
  backTxt:  { fontSize: 30, color: '#F8FAFC', lineHeight: 34 },
  pageTitle:{ fontFamily: 'Georgia', fontSize: 21, color: '#FFFFFF', flex: 1, textAlign: 'center' },
  streakPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(124,58,237,0.18)',
    borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.35)',
    minWidth: 52, justifyContent: 'center',
  },
  streakPillGold: {
    backgroundColor: 'rgba(245,158,11,0.18)',
    borderColor: 'rgba(245,158,11,0.4)',
  },
  streakIcon:    { fontSize: 13 },
  streakNum:     { color: '#A78BFA', fontSize: 14, fontWeight: '700' },
  streakNumGold: { color: '#F59E0B' },

  // ── Filters ────────────────────────────────────────────────────────────────
  filterBlock: { paddingBottom: 2 },
  filterRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: OUTER, marginBottom: 8,
  },
  filterLabel: {
    fontSize: 10, color: '#475569', letterSpacing: 1.2,
    minWidth: 54, fontWeight: '600',
  },
  chipRow: { gap: 6, paddingRight: 4 },
  chip: {
    paddingHorizontal: 13, paddingVertical: 6, borderRadius: 999,
    backgroundColor: '#1A1A2E',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  chipOn:     { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  chipTxt:    { fontSize: 11, color: '#64748B', fontWeight: '500' },
  chipTxtOn:  { color: '#FFFFFF', fontWeight: '700' },

  // ── Tab Bar ────────────────────────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: OUTER, marginBottom: 12,
    backgroundColor: '#1A1A2E',
    borderRadius: 16, padding: TB_PAD,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    position: 'relative', overflow: 'hidden',
  },
  tabIndicator: {
    position: 'absolute', top: TB_PAD,
    height: 46, backgroundColor: '#7C3AED',
    borderRadius: 13,
  },
  tabBtn: {
    flex: 1, height: 46,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
  },
  tabIcon:     { fontSize: 14 },
  tabIconOn:   {},
  tabLabel:    { fontSize: 11, color: '#64748B', fontWeight: '500' },
  tabLabelOn:  { color: '#FFFFFF', fontWeight: '700' },

  // ── Subject bar ────────────────────────────────────────────────────────────
  subjBar: {
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)',
    paddingTop: 8, marginBottom: 4,
  },

  // ── Scroll content ─────────────────────────────────────────────────────────
  scroll: { paddingHorizontal: OUTER, paddingBottom: 110, gap: 10, paddingTop: 2 },
  metaLine: { fontSize: 11, color: '#475569', marginBottom: 2, letterSpacing: 0.2 },

  // ── Empty state ────────────────────────────────────────────────────────────
  emptyBox:  { alignItems: 'center', paddingTop: 64, gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyTxt:  { fontSize: 15, color: '#64748B', fontWeight: '600' },
  emptyHint: { fontSize: 12, color: '#334155' },

  // ── Course cards ───────────────────────────────────────────────────────────
  courseCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16, overflow: 'hidden',
    borderLeftWidth: 3,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  courseGlow: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  courseInner:  { padding: 14 },
  courseTopRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 9,
  },
  badge:    { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  badgeTxt: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  providerTxt: { fontSize: 11, color: '#64748B', flex: 1 },
  openArr:  { fontSize: 16, fontWeight: '700' },
  courseTitle: { fontSize: 14, color: '#F1F5F9', fontWeight: '600', lineHeight: 20 },

  // ── Streak card ────────────────────────────────────────────────────────────
  streakCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.25)',
    overflow: 'hidden',
  },
  streakCardBody: {
    flexDirection: 'row', padding: 18, gap: 0,
  },
  streakLeft: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  streakBigNum: {
    fontFamily: 'Georgia', fontSize: 48, color: '#A78BFA',
    lineHeight: 52,
  },
  streakDayLbl: { fontSize: 11, color: '#64748B', fontWeight: '600', letterSpacing: 0.5 },
  streakPillSmall: {
    backgroundColor: 'rgba(124,58,237,0.15)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, marginTop: 2,
  },
  streakGoalInfo: { fontSize: 10, color: '#7C3AED', fontWeight: '600' },

  vDivider: {
    width: 1, backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 8,
  },

  streakRight: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  solvedBig:   { fontFamily: 'Georgia', fontSize: 48, color: '#FFFFFF', lineHeight: 52 },
  solvedLbl:   { fontSize: 11, color: '#64748B', fontWeight: '600', letterSpacing: 0.5 },

  dotRow:    { flexDirection: 'row', gap: 5, marginTop: 4 },
  dot: {
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  dotViolet: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  dotGold:   { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },

  todayTxt:     { fontSize: 10, color: '#64748B', marginTop: 2 },
  todayTxtGold: { color: '#F59E0B', fontWeight: '600' },

  editGoalRow: {
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 10, alignItems: 'center',
  },
  editGoalTxt: { fontSize: 11, color: '#7C3AED', fontWeight: '600' },

  // ── LeetCode cards ─────────────────────────────────────────────────────────
  leetCard: {
    backgroundColor: '#1A1A2E', borderRadius: 14, padding: 13,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  leetCardDone: { opacity: 0.45 },
  chk: {
    width: 22, height: 22, borderRadius: 7,
    borderWidth: 2, borderColor: '#334155',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  chkDone:  { backgroundColor: '#10B981', borderColor: '#10B981' },
  chkMark:  { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  leetMid:  { flex: 1 },
  leetTitle:{ fontSize: 13, color: '#F1F5F9', lineHeight: 18, marginBottom: 6 },
  leetTitleDone: { textDecorationLine: 'line-through', color: '#475569' },
  leetTagRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  diffPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  diffTxt:  { fontSize: 10, fontWeight: '700' },
  topicTxt: {
    fontSize: 10, color: '#475569',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  leetArr: { fontSize: 18, color: '#7C3AED', fontWeight: '700' },

  // ── Q-Bank cards ───────────────────────────────────────────────────────────
  qCard: {
    backgroundColor: '#1A1A2E', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  qCardExpanded: { borderColor: 'rgba(124,58,237,0.2)' },
  qCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 9 },
  qBadge:   { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  qBadgePYQ: { backgroundColor: 'rgba(124,58,237,0.18)' },
  qBadgeFAQ: { backgroundColor: 'rgba(16,185,129,0.18)' },
  qBadgeTxt:    { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  qBadgeTxtPYQ: { color: '#A78BFA' },
  qBadgeTxtFAQ: { color: '#10B981' },
  qSubj:    { fontSize: 11, color: '#64748B', flex: 1 },
  qChevron: { fontSize: 9, color: '#475569' },
  qTxt:     { fontSize: 13, color: '#94A3B8', lineHeight: 20 },
  qTxtExpanded: { color: '#E2E8F0' },
});
