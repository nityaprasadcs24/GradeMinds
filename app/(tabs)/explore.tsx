import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated as RNAnimated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQGenStore, ChatMessage } from '../../store/qgenStore';

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
  const dot0 = useRef(new RNAnimated.Value(0)).current;
  const dot1 = useRef(new RNAnimated.Value(0)).current;
  const dot2 = useRef(new RNAnimated.Value(0)).current;
  const dots = [dot0, dot1, dot2];

  useEffect(() => {
    const anims = dots.map((dot, i) =>
      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.delay(i * 160),
          RNAnimated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          RNAnimated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          RNAnimated.delay((2 - i) * 160 + 100),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.typingBubble}>
      <Text style={styles.botAvatar}>⚡</Text>
      <View style={styles.dotsRow}>
        {dots.map((dot, i) => (
          <RNAnimated.View
            key={i}
            style={[
              styles.dot,
              {
                opacity: dot,
                transform: [
                  {
                    translateY: dot.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -4],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  const time = msg.timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowBot]}>
      {!isUser && <Text style={styles.botAvatar}>⚡</Text>}
      <View style={{ flex: 1, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Text style={styles.bubbleText}>{msg.content}</Text>
        </View>
        <Text style={styles.timestamp}>{time}</Text>
      </View>
    </View>
  );
}

// ── Quick prompt chips ────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  'Explain recursion simply',
  'Help me prep for exams',
  'Solve this math problem',
  'Summarize a concept',
];

// ── Main screen ───────────────────────────────────────────────────────────────
export default function QGenScreen() {
  const { messages, isLoading, error, sendMessage, clearChat } = useQGenStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const canSend = input.trim().length > 0 && !isLoading;

  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    await sendMessage(text);
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  const isEmpty = messages.length === 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Q-Gen AI</Text>
          <Text style={styles.headerSubtitle}>Your study assistant</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.statusBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
          {messages.length > 0 && (
            <TouchableOpacity onPress={clearChat} style={styles.clearBtn}>
              <Ionicons name="trash-outline" size={16} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Chat area */}
        <ScrollView
          ref={scrollRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          {/* Welcome message */}
          <View style={styles.welcomeRow}>
            <View style={styles.welcomeBubble}>
              <Text style={styles.botAvatar}>⚡</Text>
              <View style={styles.welcomeText}>
                <Text style={styles.bubbleText}>
                  Hey! I'm Q-Gen 👋 Ask me anything about your studies — concepts,
                  problems, exam prep, I've got you.
                </Text>
              </View>
            </View>
            <Text style={[styles.timestamp, { marginLeft: 34 }]}>just now</Text>
          </View>

          {/* Quick prompt chips (shown when no messages yet) */}
          {isEmpty && (
            <View style={styles.chipsSection}>
              <Text style={styles.chipsLabel}>Try asking</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipsRow}>
                  {QUICK_PROMPTS.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={styles.chip}
                      onPress={() => handleQuickPrompt(p)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.chipText}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {/* Typing indicator */}
          {isLoading && <TypingDots />}

          {/* Error bubble */}
          {error && (
            <View style={styles.errorBubble}>
              <Ionicons name="warning-outline" size={14} color="#F59E0B" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask Q-Gen anything..."
            placeholderTextColor="#475569"
            multiline
            maxLength={2000}
          />
          {input.length > 200 && (
            <Text style={styles.charCount}>{input.length}/2000</Text>
          )}
          <TouchableOpacity
            style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!canSend}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-up"
              size={18}
              color={canSend ? '#F8FAFC' : '#475569'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerLeft: { gap: 2 },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16,185,129,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  clearBtn: { padding: 4 },

  // Chat
  chatArea: { flex: 1 },
  chatContent: {
    padding: 16,
    paddingBottom: 8,
    gap: 4,
  },

  // Welcome
  welcomeRow: { marginBottom: 8 },
  welcomeBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  welcomeText: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  // Chips
  chipsSection: { marginTop: 16, marginBottom: 8 },
  chipsLabel: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(124,58,237,0.08)',
  },
  chipText: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: '500',
  },

  // Bubbles
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 5,
    gap: 8,
  },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubbleRowBot: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: '#7C3AED',
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    color: '#F8FAFC',
    lineHeight: 20,
  },
  botAvatar: {
    fontSize: 16,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 10,
    color: '#475569',
    marginTop: 3,
  },

  // Typing indicator
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 5,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderTopLeftRadius: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
  },

  // Error
  errorBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 6,
    alignSelf: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    gap: 10,
    backgroundColor: '#0D0D1A',
  },
  input: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    color: '#F8FAFC',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  charCount: {
    position: 'absolute',
    bottom: 28,
    right: 70,
    fontSize: 10,
    color: '#475569',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  sendBtnDisabled: {
    backgroundColor: '#1A1A2E',
    shadowOpacity: 0,
    elevation: 0,
  },
});
