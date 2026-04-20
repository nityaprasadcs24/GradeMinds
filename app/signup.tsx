import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function Signup() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setIsLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });

    setIsLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.replace('/login');
    }, 2000);
  };

  if (success) {
    return (
      <View style={styles.successScreen}>
        <Text style={styles.successIcon}>✉️</Text>
        <Text style={styles.successTitle}>Check your email</Text>
        <Text style={styles.successSub}>
          We sent a confirmation link to{'\n'}
          <Text style={styles.successEmail}>{email}</Text>
        </Text>
        <Text style={styles.successHint}>Redirecting to login…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Wordmark */}
        <Text style={styles.wordmark}>GradeMinds</Text>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.heading}>Create account</Text>
          <Text style={styles.subheading}>Start your academic journey</Text>

          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={[styles.input, nameFocused && styles.inputFocused]}
            value={fullName}
            onChangeText={setFullName}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            placeholder="Your full name"
            placeholderTextColor="#4B5563"
            autoCapitalize="words"
            autoCorrect={false}
          />

          {/* Email */}
          <Text style={[styles.label, { marginTop: 16 }]}>College Email</Text>
          <TextInput
            style={[styles.input, emailFocused && styles.inputFocused]}
            value={email}
            onChangeText={setEmail}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            placeholder="you@bmsce.ac.in"
            placeholderTextColor="#4B5563"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Password */}
          <View style={styles.labelRow}>
            <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.input, passwordFocused && styles.inputFocused]}
            value={password}
            onChangeText={setPassword}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            placeholder="At least 6 characters"
            placeholderTextColor="#4B5563"
            secureTextEntry={!showPassword}
          />

          {/* Confirm Password */}
          <Text style={[styles.label, { marginTop: 16 }]}>Confirm Password</Text>
          <TextInput
            style={[styles.input, confirmFocused && styles.inputFocused]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onFocus={() => setConfirmFocused(true)}
            onBlur={() => setConfirmFocused(false)}
            placeholder="Re-enter your password"
            placeholderTextColor="#4B5563"
            secureTextEntry={!showPassword}
          />

          {/* Error */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpBtn, isLoading && styles.signUpBtnDisabled]}
            onPress={handleSignUp}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Text style={styles.signUpText}>
              {isLoading ? 'Creating account…' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Back to login */}
        <View style={styles.loginRow}>
          <Text style={styles.loginPrompt}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={styles.loginLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D1A' },
  scroll: { flexGrow: 1, paddingBottom: 40 },

  wordmark: {
    fontFamily: 'Georgia',
    fontSize: 18,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 60,
  },

  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    padding: 28,
    marginHorizontal: 20,
    marginTop: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  heading: {
    fontFamily: 'Georgia',
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },

  label: { fontSize: 12, color: '#64748B', marginBottom: 6 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  eyeIcon: { fontSize: 16, marginBottom: 6 },

  input: {
    backgroundColor: '#0D0D1A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  inputFocused: { borderColor: '#7C3AED' },

  error: { color: '#EF4444', fontSize: 13, marginTop: 12 },

  signUpBtn: {
    marginTop: 24,
    backgroundColor: '#7C3AED',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signUpBtnDisabled: { opacity: 0.6 },
  signUpText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginPrompt: { color: '#64748B', fontSize: 14 },
  loginLink: { color: '#7C3AED', fontSize: 14 },

  // Success screen
  successScreen: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  successIcon: { fontSize: 48, marginBottom: 20 },
  successTitle: {
    fontFamily: 'Georgia',
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  successSub: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
  },
  successEmail: { color: '#7C3AED', fontWeight: '600' },
  successHint: {
    fontSize: 12,
    color: '#475569',
    marginTop: 32,
  },
});
