import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width: W, height: H } = Dimensions.get('window');

export default function Splash() {
  const router = useRouter();
  const [showButton, setShowButton] = useState(false);

  const bulbAnim    = useRef(new Animated.Value(0)).current;
  const coreOpacity = useRef(new Animated.Value(0)).current;
  const coreScale   = useRef(new Animated.Value(0.5)).current;
  const glowAnim    = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY      = useRef(new Animated.Value(16)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;
  const lineScale   = useRef(new Animated.Value(0)).current;
  const btmOpacity  = useRef(new Animated.Value(0)).current;
  const btnOpacity  = useRef(new Animated.Value(0)).current;
  const btnY        = useRef(new Animated.Value(20)).current;
  const stringPull  = useRef(new Animated.Value(0)).current;

  const particles = useRef(
    Array.from({ length: 12 }, () => ({
      opacity: new Animated.Value(0),
      y: new Animated.Value(0),
      left: W * 0.3 + Math.random() * W * 0.4,
      top: H * 0.22 + Math.random() * H * 0.25,
    }))
  ).current;

  useEffect(() => {
    StatusBar.setHidden(true);

    Animated.timing(stringPull, { toValue: 1, duration: 600, delay: 1000, useNativeDriver: true }).start();

    Animated.timing(bulbAnim, { toValue: 1, duration: 2200, delay: 2000, useNativeDriver: false }).start();

    Animated.timing(glowAnim, { toValue: 1, duration: 3000, delay: 1800, useNativeDriver: true }).start();

    Animated.parallel([
      Animated.timing(coreOpacity, { toValue: 1, duration: 1500, delay: 2600, useNativeDriver: true }),
      Animated.spring(coreScale, { toValue: 1, delay: 2600, useNativeDriver: true }),
    ]).start();

    Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 1, duration: 1500, delay: 2800, useNativeDriver: true }),
      Animated.timing(titleY, { toValue: 0, duration: 1500, delay: 2800, useNativeDriver: true }),
    ]).start();

    Animated.timing(tagOpacity, { toValue: 1, duration: 1200, delay: 3300, useNativeDriver: true }).start();
    Animated.timing(lineScale, { toValue: 1, duration: 800, delay: 3600, useNativeDriver: true }).start();
    Animated.timing(btmOpacity, { toValue: 1, duration: 1200, delay: 3800, useNativeDriver: true }).start();

    const t = setTimeout(() => {
      setShowButton(true);
      Animated.parallel([
        Animated.timing(btnOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(btnY, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]).start();
    }, 5000);

    particles.forEach((p, i) => {
      const loop = () => {
        p.opacity.setValue(0);
        p.y.setValue(0);
        Animated.sequence([
          Animated.delay(i * 300),
          Animated.parallel([
            Animated.sequence([
              Animated.timing(p.opacity, { toValue: 0.8, duration: 700, useNativeDriver: true }),
              Animated.timing(p.opacity, { toValue: 0, duration: 3800, useNativeDriver: true }),
            ]),
            Animated.timing(p.y, { toValue: 100 + Math.random() * 60, duration: 4500, useNativeDriver: true }),
          ]),
        ]).start(() => loop());
      };
      setTimeout(() => loop(), 2800 + i * 250);
    });

    return () => { clearTimeout(t); StatusBar.setHidden(false); };
  }, []);

  const bulbBg = bulbAnim.interpolate({
    inputRange: [0, 1], outputRange: ['#2A1F38', '#E8D4A0'],
  });
  const bulbShadow = bulbAnim.interpolate({
    inputRange: [0, 1], outputRange: [0, 60],
  });
  const stringH = stringPull.interpolate({
    inputRange: [0, 1], outputRange: [36, 58],
  });
  const tabTY = stringPull.interpolate({
    inputRange: [0, 1], outputRange: [0, 20],
  });

  return (
    <View style={styles.root}>

      {/* ── Soft light glow layers (no hard edges, all blurred circles) ── */}
      <Animated.View style={[styles.glow1, { opacity: glowAnim }]} pointerEvents="none" />
      <Animated.View style={[styles.glow2, { opacity: glowAnim }]} pointerEvents="none" />
      <Animated.View style={[styles.glow3, { opacity: glowAnim }]} pointerEvents="none" />
      <Animated.View style={[styles.glow4, { opacity: glowAnim }]} pointerEvents="none" />

      {/* ── Lamp ── */}
      <View style={styles.lamp}>
        {/* Ceiling cord */}
        <View style={styles.cord} />

        {/* Lampshade — proper trapezoid, wider than bulb */}
        <View style={styles.shade} />
        <View style={styles.shadeRim} />

        {/* Bulb */}
        <Animated.View
          style={[
            styles.bulb,
            {
              backgroundColor: bulbBg,
              shadowColor: '#E8D4A0',
              shadowOpacity: 1,
              shadowRadius: bulbShadow,
              shadowOffset: { width: 0, height: 0 },
              elevation: 30,
            },
          ]}
        >
          <Animated.View
            style={[styles.bulbCore, { opacity: coreOpacity, transform: [{ scale: coreScale }] }]}
          />
        </Animated.View>

        {/* Pull string */}
        <Animated.View style={[styles.pullString, { height: stringH }]} />
        <Animated.View style={[styles.pullTab, { transform: [{ translateY: tabTY }] }]} />
      </View>

      {/* ── Dust particles ── */}
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            { left: p.left, top: p.top, opacity: p.opacity, transform: [{ translateY: p.y }] },
          ]}
        />
      ))}

      {/* ── Center content — absolutely centered on screen ── */}
      <View style={styles.centerContent}>
        <Animated.Text
          style={[styles.title, { opacity: titleOpacity, transform: [{ translateY: titleY }] }]}
        >
          GradeMinds
        </Animated.Text>

        <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
          THINK ALIKE
        </Animated.Text>

        <Animated.View
          style={[styles.divider, { opacity: tagOpacity, transform: [{ scaleX: lineScale }] }]}
        />
      </View>

      {/* ── Bottom section ── */}
      <Animated.View style={[styles.bottom, { opacity: btmOpacity }]}>
        <Text style={styles.subtitle}>WHERE LEARNING FINDS ITS LIGHT</Text>

        {showButton && (
          <Animated.View style={{ width: '100%', opacity: btnOpacity, transform: [{ translateY: btnY }] }}>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => router.replace('/login')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>Get Started</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <Text style={styles.domain}>
          grademinds<Text style={{ color: '#6B5580' }}>.bmsce</Text>
        </Text>

        <View style={styles.dotsRow}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i === 0 ? '#8B6BA8' : '#4A3B5C' }]} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

// Lamp measurements
const CORD_H  = 80;
const SHADE_W = 160; // wide lampshade
const SHADE_H = 70;
const BULB_D  = 64;
// Approximate Y center of bulb from top
const BULB_Y  = 48 + CORD_H + SHADE_H + BULB_D / 2;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F0A1C',
    alignItems: 'center',
  },

  // ── Soft glow layers — stacked ellipses that fade out naturally ──
  // Big outermost halo
  glow1: {
    position: 'absolute',
    top: BULB_Y - 40,
    left: W / 2 - 200,
    width: 400,
    height: 520,
    borderRadius: 200,
    backgroundColor: 'rgba(255,248,200,0.03)',
    shadowColor: '#FFF8C8',
    shadowOpacity: 0.5,
    shadowRadius: 80,
    shadowOffset: { width: 0, height: 40 },
  },
  // Mid halo
  glow2: {
    position: 'absolute',
    top: BULB_Y - 20,
    left: W / 2 - 140,
    width: 280,
    height: 440,
    borderRadius: 140,
    backgroundColor: 'rgba(255,248,200,0.04)',
    shadowColor: '#FFF8C8',
    shadowOpacity: 0.6,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 30 },
  },
  // Inner warm cone
  glow3: {
    position: 'absolute',
    top: BULB_Y,
    left: W / 2 - 90,
    width: 180,
    height: 360,
    borderRadius: 90,
    backgroundColor: 'rgba(255,250,210,0.05)',
    shadowColor: '#FFFADC',
    shadowOpacity: 0.8,
    shadowRadius: 50,
    shadowOffset: { width: 0, height: 20 },
  },
  // Brightest centre spot just below bulb
  glow4: {
    position: 'absolute',
    top: BULB_Y - 10,
    left: W / 2 - 50,
    width: 100,
    height: 120,
    borderRadius: 50,
    backgroundColor: 'rgba(255,254,230,0.08)',
    shadowColor: '#FFFEF0',
    shadowOpacity: 1,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 10 },
  },

  // ── Lamp ──
  lamp: {
    alignItems: 'center',
    marginTop: 48,
  },
  cord: {
    width: 2,
    height: CORD_H,
    backgroundColor: '#2A2535',
  },
  // Trapezoid shade — wider than bulb
  shade: {
    width: 0,
    height: 0,
    borderLeftWidth: SHADE_W / 2,
    borderRightWidth: SHADE_W / 2,
    borderBottomWidth: SHADE_H,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#2A1F38',
    borderStyle: 'solid',
  },
  shadeRim: {
    width: SHADE_W + 8,
    height: 5,
    backgroundColor: '#1A1226',
    borderRadius: 3,
    marginTop: -2,
  },
  bulb: {
    width: BULB_D,
    height: BULB_D,
    borderRadius: BULB_D / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  bulbCore: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF8E1',
  },
  pullString: {
    width: 2,
    backgroundColor: '#3A3142',
    marginTop: 4,
  },
  pullTab: {
    width: 12,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#2A2535',
    borderWidth: 1,
    borderColor: '#3A3142',
    marginTop: 2,
  },

  // ── Particles ──
  particle: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(232,212,160,0.7)',
  },

  // ── Center content — absolute center of screen ──
  centerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 50,
    color: '#FFFFF0',
    fontFamily: 'Georgia',
    fontWeight: '400',
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 11,
    color: '#8B6BA8',
    letterSpacing: 8,
    marginBottom: 18,
  },
  divider: {
    width: 96,
    height: 1,
    backgroundColor: '#3A3142',
  },

  // ── Bottom ──
  bottom: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 14,
  },
  subtitle: {
    fontSize: 9,
    color: '#8B6BA8',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 4,
  },
  btn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: '#7248D4',
    alignItems: 'center',
    shadowColor: '#7248D4',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    marginBottom: 4,
  },
  btnText: {
    color: '#EDE5FF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  domain: {
    fontSize: 10,
    color: '#3A2D52',
    letterSpacing: 2,
  },
  dotsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
