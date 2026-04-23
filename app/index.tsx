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

  // Animation values
  const bulbAnim     = useRef(new Animated.Value(0)).current;
  const coreOpacity  = useRef(new Animated.Value(0)).current;
  const coreScale    = useRef(new Animated.Value(0.5)).current;
  const coneOpacity  = useRef(new Animated.Value(0)).current;
  const glowOpacity  = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY       = useRef(new Animated.Value(16)).current;
  const tagOpacity   = useRef(new Animated.Value(0)).current;
  const lineScale    = useRef(new Animated.Value(0)).current;
  const btmOpacity   = useRef(new Animated.Value(0)).current;
  const btnOpacity   = useRef(new Animated.Value(0)).current;
  const btnY         = useRef(new Animated.Value(20)).current;
  const stringPull   = useRef(new Animated.Value(0)).current;

  // Particles
  const particles = useRef(
    Array.from({ length: 10 }, (_, i) => ({
      opacity: new Animated.Value(0),
      y: new Animated.Value(0),
      left: W * 0.35 + Math.random() * W * 0.3,
      top: H * 0.18 + Math.random() * H * 0.2,
    }))
  ).current;

  useEffect(() => {
    StatusBar.setHidden(true);

    // String pull at 1s
    Animated.timing(stringPull, {
      toValue: 1, duration: 600, delay: 1000, useNativeDriver: true,
    }).start();

    // Bulb glow at 2s
    Animated.timing(bulbAnim, {
      toValue: 1, duration: 2200, delay: 2000, useNativeDriver: false,
    }).start();

    // Light cone appears
    Animated.timing(coneOpacity, {
      toValue: 1, duration: 2800, delay: 1800, useNativeDriver: true,
    }).start();

    // Room glow
    Animated.timing(glowOpacity, {
      toValue: 1, duration: 2500, delay: 2200, useNativeDriver: true,
    }).start();

    // Bulb core
    Animated.parallel([
      Animated.timing(coreOpacity, { toValue: 1, duration: 1500, delay: 2600, useNativeDriver: true }),
      Animated.spring(coreScale, { toValue: 1, delay: 2600, useNativeDriver: true }),
    ]).start();

    // Title
    Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 1, duration: 1500, delay: 2800, useNativeDriver: true }),
      Animated.timing(titleY, { toValue: 0, duration: 1500, delay: 2800, useNativeDriver: true }),
    ]).start();

    // Tagline + line
    Animated.timing(tagOpacity, { toValue: 1, duration: 1200, delay: 3300, useNativeDriver: true }).start();
    Animated.timing(lineScale, { toValue: 1, duration: 800, delay: 3600, useNativeDriver: true }).start();

    // Bottom
    Animated.timing(btmOpacity, { toValue: 1, duration: 1200, delay: 3800, useNativeDriver: true }).start();

    // Button at 5s
    const t = setTimeout(() => {
      setShowButton(true);
      Animated.parallel([
        Animated.timing(btnOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(btnY, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]).start();
    }, 5000);

    // Particles
    particles.forEach((p, i) => {
      const loop = () => {
        p.opacity.setValue(0);
        p.y.setValue(0);
        Animated.sequence([
          Animated.delay(2800 + i * 300),
          Animated.parallel([
            Animated.sequence([
              Animated.timing(p.opacity, { toValue: 0.8, duration: 600, useNativeDriver: true }),
              Animated.timing(p.opacity, { toValue: 0, duration: 3500, useNativeDriver: true }),
            ]),
            Animated.timing(p.y, { toValue: 90 + Math.random() * 50, duration: 4100, useNativeDriver: true }),
          ]),
        ]).start(() => loop());
      };
      setTimeout(() => loop(), i * 200);
    });

    return () => {
      clearTimeout(t);
      StatusBar.setHidden(false);
    };
  }, []);

  const bulbBg = bulbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#2A1F38', '#E8D4A0'],
  });
  const bulbShadow = bulbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 50],
  });
  const stringH = stringPull.interpolate({
    inputRange: [0, 1],
    outputRange: [36, 56],
  });
  const tabTY = stringPull.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 18],
  });

  return (
    <View style={styles.root}>

      {/* ── Ambient room glow (behind everything) ── */}
      <Animated.View style={[styles.roomGlow, { opacity: glowOpacity }]} pointerEvents="none" />

      {/* ── Light beam cone ── */}
      <Animated.View style={[styles.coneOuter, { opacity: coneOpacity }]} pointerEvents="none" />
      <Animated.View style={[styles.coneMid,   { opacity: coneOpacity }]} pointerEvents="none" />
      <Animated.View style={[styles.coneInner, { opacity: coneOpacity }]} pointerEvents="none" />

      {/* ── Lamp assembly ── */}
      <View style={styles.lamp}>
        {/* Ceiling cord */}
        <View style={styles.cord} />

        {/* Lampshade — cone shape using borders */}
        <View style={styles.shade} />

        {/* Shade bottom rim */}
        <View style={styles.shadeRim} />

        {/* Bulb */}
        <Animated.View
          style={[
            styles.bulb,
            {
              backgroundColor: bulbBg,
              shadowColor: '#E8D4A0',
              shadowOpacity: 0.9,
              shadowRadius: bulbShadow,
              shadowOffset: { width: 0, height: 0 },
              elevation: 30,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.bulbCore,
              { opacity: coreOpacity, transform: [{ scale: coreScale }] },
            ]}
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

      {/* ── GradeMinds text ── */}
      <View style={styles.textArea}>
        <Animated.Text
          style={[styles.title, { opacity: titleOpacity, transform: [{ translateY: titleY }] }]}
        >
          GradeMinds
        </Animated.Text>

        <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
          THINK ALIKE
        </Animated.Text>

        <Animated.View style={[styles.divider, { opacity: tagOpacity, transform: [{ scaleX: lineScale }] }]} />
      </View>

      {/* ── Bottom ── */}
      <Animated.View style={[styles.bottom, { opacity: btmOpacity }]}>
        <Text style={styles.subtitle}>WHERE LEARNING FINDS ITS LIGHT</Text>

        {showButton && (
          <Animated.View style={{ width: '100%', opacity: btnOpacity, transform: [{ translateY: btnY }] }}>
            <TouchableOpacity style={styles.btn} onPress={() => router.replace('/login')} activeOpacity={0.85}>
              <Text style={styles.btnText}>Get Started</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <Text style={styles.domain}>
          grademinds<Text style={{ color: '#6B5580' }}>.bmsce</Text>
        </Text>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i === 0 ? '#8B6BA8' : '#4A3B5C' }]} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const LAMP_TOP = 48;
const CORD_H   = 72;
const SHADE_H  = 56;
const BULB_TOP = LAMP_TOP + CORD_H + SHADE_H + 4; // approx y of bulb center

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F0A1C',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 48,
  },

  // Ambient glow
  roomGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: H * 0.55,
    backgroundColor: 'transparent',
    shadowColor: '#E8D4A0',
    shadowOpacity: 0.12,
    shadowRadius: 120,
    shadowOffset: { width: 0, height: 80 },
  },

  // Cones — use semi-transparent Views with border radius as glow blobs
  coneOuter: {
    position: 'absolute',
    top: BULB_TOP + 32,
    left: W / 2 - 220,
    width: 440,
    height: 560,
    borderRadius: 220,
    backgroundColor: 'rgba(255,248,220,0.06)',
  },
  coneMid: {
    position: 'absolute',
    top: BULB_TOP + 32,
    left: W / 2 - 150,
    width: 300,
    height: 480,
    borderRadius: 150,
    backgroundColor: 'rgba(255,248,220,0.09)',
  },
  coneInner: {
    position: 'absolute',
    top: BULB_TOP + 32,
    left: W / 2 - 90,
    width: 180,
    height: 380,
    borderRadius: 90,
    backgroundColor: 'rgba(255,254,240,0.13)',
  },

  // Lamp
  lamp: {
    alignItems: 'center',
    marginTop: LAMP_TOP,
  },
  cord: {
    width: 2,
    height: CORD_H,
    backgroundColor: '#2A2535',
  },
  // Trapezoid lampshade via border trick
  shade: {
    width: 0,
    height: 0,
    borderLeftWidth: 44,
    borderRightWidth: 44,
    borderTopWidth: 0,
    borderBottomWidth: SHADE_H,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#2A1F38',
    borderStyle: 'solid',
  },
  shadeRim: {
    width: 96,
    height: 4,
    backgroundColor: '#1A1226',
    borderRadius: 2,
    marginTop: -2,
  },
  bulb: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  bulbCore: {
    width: 38,
    height: 38,
    borderRadius: 19,
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

  // Particle
  particle: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(232,212,160,0.7)',
  },

  // Text
  textArea: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 32,
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

  // Bottom
  bottom: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 32,
    gap: 14,
  },
  subtitle: {
    fontSize: 9,
    color: '#8B6BA8',
    letterSpacing: 4,
    textAlign: 'center',
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
  dotsRow: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
