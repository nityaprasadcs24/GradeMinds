import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width: W, height: H } = Dimensions.get('window');
const ACCENT = '#8B6BA8';

// ─── Dust particle config (from original DUST array) ──────────────────────────
const DUST = [
  { left: 0.47, top: 0.24, s: 3, dur: 5000,   delay: 2600 },
  { left: 0.52, top: 0.30, s: 2, dur: 6000,   delay: 3200 },
  { left: 0.44, top: 0.28, s: 2, dur: 5500, delay: 3800 },
  { left: 0.56, top: 0.22, s: 3, dur: 6500, delay: 4100 },
  { left: 0.49, top: 0.34, s: 2, dur: 5200, delay: 4600 },
  { left: 0.54, top: 0.26, s: 2, dur: 6200, delay: 5000 },
];

export default function Splash() {
  const router = useRouter();
  const [pressed, setPressed] = useState(false);

  // ── Animated values, timed to mirror the web keyframes ──
  const sway        = useRef(new Animated.Value(0)).current;   // -1.8deg <-> 1.8deg loop
  const pullY        = useRef(new Animated.Value(0)).current;   // string pull bounce
  const bulbAnim     = useRef(new Animated.Value(0)).current;   // bg color + shadow 1.95s→3.35s
  const coreOpacity  = useRef(new Animated.Value(0)).current;
  const coreScale    = useRef(new Animated.Value(0.4)).current;
  const glowOpacity  = useRef(new Animated.Value(0)).current;
  const glowScale    = useRef(new Animated.Value(0.7)).current;
  const cone1        = useRef(new Animated.Value(0)).current;
  const cone2        = useRef(new Animated.Value(0)).current;
  const cone3        = useRef(new Animated.Value(0)).current;
  const ambientOp    = useRef(new Animated.Value(0)).current;
  const flashOp      = useRef(new Animated.Value(0)).current;

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY       = useRef(new Animated.Value(14)).current;
  const tagOpacity   = useRef(new Animated.Value(0)).current;
  const lineScale    = useRef(new Animated.Value(0)).current;
  const subOpacity   = useRef(new Animated.Value(0)).current;
  const dotsOpacity  = useRef(new Animated.Value(0)).current;
  const domainOpacity = useRef(new Animated.Value(0)).current;
  const btnOpacity   = useRef(new Animated.Value(0)).current;
  const btnY         = useRef(new Animated.Value(14)).current;

  const dotAnims = useRef([0, 1, 2].map(() => new Animated.Value(0.22))).current;

  const particles = useRef(
    DUST.map((d) => ({
      opacity: new Animated.Value(0),
      y: new Animated.Value(0),
      cfg: d,
    }))
  ).current;

  useEffect(() => {
    StatusBar.setHidden(true);

    // Continuous gentle sway (6.5s loop, ease-in-out)
    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: 3250, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(sway, { toValue: -1, duration: 3250, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    sway.setValue(-1);
    swayLoop.start();

    // Pull-string bounce: 0->42% hold, 56% down to 17px, 68% up to 3px, 80% to 9px, 100% back to 0. Total 3s.
    Animated.sequence([
      Animated.delay(1260), // 42% of 3000ms
      Animated.timing(pullY, { toValue: 17, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }), // to 56%
      Animated.timing(pullY, { toValue: 3, duration: 360, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }), // to 68%
      Animated.timing(pullY, { toValue: 9, duration: 360, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }), // to 80%
      Animated.timing(pullY, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }), // to 100%
    ]).start();

    // Bulb lights up: starts at 1.95s, duration 1.4s
    Animated.timing(bulbAnim, {
      toValue: 1, duration: 1400, delay: 1950, easing: Easing.inOut(Easing.cubic), useNativeDriver: false,
    }).start();

    // Glow: starts 2s, duration 1.6s
    Animated.parallel([
      Animated.timing(glowOpacity, { toValue: 0.9, duration: 1600, delay: 2000, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(glowScale, { toValue: 1.25, duration: 1600, delay: 2000, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    // Core: starts 2.05s, duration 1.2s
    Animated.parallel([
      Animated.timing(coreOpacity, { toValue: 1, duration: 1200, delay: 2050, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(coreScale, { toValue: 1, duration: 1200, delay: 2050, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    // Light cones: staggered starts at 2s, 2.15s, 2.3s — each 2.4s ease-out
    Animated.timing(cone1, { toValue: 1, duration: 2400, delay: 2000, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    Animated.timing(cone2, { toValue: 1, duration: 2400, delay: 2150, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    Animated.timing(cone3, { toValue: 1, duration: 2400, delay: 2300, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();

    // Ambient room glow: starts at 2s, duration 2s
    Animated.timing(ambientOp, { toValue: 1, duration: 2000, delay: 2000, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();

    // Click flash: starts 1.95s, duration 0.9s (0% op0 -> 18% op.45 -> 100% op0)
    Animated.sequence([
      Animated.delay(1950),
      Animated.timing(flashOp, { toValue: 0.45, duration: 162, useNativeDriver: true }), // 18% of 900ms
      Animated.timing(flashOp, { toValue: 0, duration: 738, useNativeDriver: true }),
    ]).start();

    // Title rise: starts 2.6s, duration 1s
    Animated.parallel([
      Animated.timing(titleOpacity, { toValue: 1, duration: 1000, delay: 2600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(titleY, { toValue: 0, duration: 1000, delay: 2600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    // Tagline fade: starts 3.0s, duration 1.1s
    Animated.timing(tagOpacity, { toValue: 1, duration: 1100, delay: 3000, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();

    // Divider line: starts 3.4s, duration 0.8s
    Animated.timing(lineScale, { toValue: 1, duration: 800, delay: 3400, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();

    // Subtitle "WHERE LEARNING..." fade: starts 3.9s, duration 1.1s
    Animated.timing(subOpacity, { toValue: 1, duration: 1100, delay: 3900, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();

    // Domain text fade: starts 4.4s, duration 1s
    Animated.timing(domainOpacity, { toValue: 1, duration: 1000, delay: 4400, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();

    // Dots container fade: starts 4.2s, duration 1s
    Animated.timing(dotsOpacity, { toValue: 1, duration: 1000, delay: 4200, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();

    // Dot pulse loops: 2.1s each, staggered starts 4.4s / 4.7s / 5.0s
    dotAnims.forEach((val, i) => {
      const loop = () => {
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration: 462, easing: Easing.inOut(Easing.sin), useNativeDriver: false }), // 22%
          Animated.timing(val, { toValue: 0.22, duration: 588, easing: Easing.inOut(Easing.sin), useNativeDriver: false }), // to 50%
          Animated.timing(val, { toValue: 0.22, duration: 1050, useNativeDriver: false }), // hold to 100%
        ]).start(() => loop());
      };
      setTimeout(loop, 4400 + i * 300);
    });

    // Button rise: starts 4.8s, duration 0.7s
    Animated.parallel([
      Animated.timing(btnOpacity, { toValue: 1, duration: 700, delay: 4800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(btnY, { toValue: 0, duration: 700, delay: 4800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    // Dust particles loop infinitely with individual durations/delays
    particles.forEach((p) => {
      const loop = () => {
        p.opacity.setValue(0);
        p.y.setValue(0);
        Animated.sequence([
          Animated.parallel([
            Animated.sequence([
              Animated.timing(p.opacity, { toValue: 0.75, duration: p.cfg.dur * 0.25, useNativeDriver: true }),
              Animated.timing(p.opacity, { toValue: 0.35, duration: p.cfg.dur * 0.5, useNativeDriver: true }),
              Animated.timing(p.opacity, { toValue: 0, duration: p.cfg.dur * 0.25, useNativeDriver: true }),
            ]),
            Animated.timing(p.y, { toValue: 72, duration: p.cfg.dur, useNativeDriver: true }),
          ]),
        ]).start(() => loop());
      };
      setTimeout(loop, p.cfg.delay);
    });

    return () => {
      StatusBar.setHidden(false);
    };
  }, []);

  // ── Interpolations ──
  const swayDeg = sway.interpolate({ inputRange: [-1, 1], outputRange: ['-1.8deg', '1.8deg'] });
  const bulbBg = bulbAnim.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: ['#2A1F38', '#FFF6DD', '#E8D4A0'],
  });
  const bulbShadowRadius = bulbAnim.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 52, 38] });
  const bulbShadowOpacity = bulbAnim.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 0.55, 0.42] });

  return (
    <View style={styles.root}>

      {/* ── Ambient room glow ── */}
      <Animated.View
        style={[styles.ambientGlow, { opacity: ambientOp }]}
        pointerEvents="none"
      />

      {/* ── Light cones (3 layered, staggered) ── */}
      <Animated.View style={[styles.coneOuter, { opacity: cone1 }]} pointerEvents="none" />
      <Animated.View style={[styles.coneMid,   { opacity: cone2 }]} pointerEvents="none" />
      <Animated.View style={[styles.coneInner, { opacity: cone3 }]} pointerEvents="none" />

      {/* ── Lamp (swaying) ── */}
      <Animated.View style={[styles.lampWrap, { transform: [{ rotate: swayDeg }] }]}>
        {/* Ceiling cord */}
        <View style={styles.cord} />

        {/* Lampshade — trapezoid via border trick */}
        <View style={styles.shadeCap} />
        <View style={styles.shade} />
        <View style={styles.shadeRim} />

        {/* Bulb assembly */}
        <View style={styles.bulbWrap}>
          {/* Outer soft glow */}
          <Animated.View
            style={[
              styles.bulbGlow,
              { opacity: glowOpacity, transform: [{ scale: glowScale }] },
            ]}
          />
          {/* Bulb body */}
          <Animated.View
            style={[
              styles.bulb,
              {
                backgroundColor: bulbBg,
                shadowColor: '#E8D4A0',
                shadowOpacity: bulbShadowOpacity,
                shadowRadius: bulbShadowRadius,
                shadowOffset: { width: 0, height: 0 },
                elevation: 25,
              },
            ]}
          />
          {/* Bright core */}
          <Animated.View
            style={[
              styles.bulbCore,
              { opacity: coreOpacity, transform: [{ scale: coreScale }] },
            ]}
          />

          {/* Pull string */}
          <Animated.View style={[styles.pullStringWrap, { transform: [{ translateY: pullY }] }]}>
            <View style={styles.pullString} />
            <View style={styles.pullTab} />
          </Animated.View>
        </View>
      </Animated.View>

      {/* ── Dust particles ── */}
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              left: p.cfg.left * W,
              top: p.cfg.top * H,
              width: p.cfg.s,
              height: p.cfg.s,
              opacity: p.opacity,
              transform: [{ translateY: p.y }],
            },
          ]}
        />
      ))}

      {/* ── Content: title / tagline / divider ── */}
      <View style={styles.contentWrap}>
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
      <View style={styles.bottomWrap}>
        <Animated.View style={{ opacity: btnOpacity, transform: [{ translateY: btnY }], width: '100%' }}>
          <TouchableOpacity
            style={[styles.btn, pressed && styles.btnPressed]}
            onPress={() => router.replace('/login')}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            activeOpacity={1}
          >
            <Text style={styles.btnText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.Text style={[styles.subtitle, { opacity: subOpacity }]}>
          WHERE LEARNING FINDS ITS LIGHT
        </Animated.Text>

        <Animated.View style={[styles.dotsRow, { opacity: dotsOpacity }]}>
          {dotAnims.map((val, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  opacity: val,
                  transform: [{
                    scale: val.interpolate({ inputRange: [0.22, 1], outputRange: [1, 1.35] }),
                  }],
                },
              ]}
            />
          ))}
        </Animated.View>

        <Animated.Text style={[styles.domain, { opacity: domainOpacity }]}>
          grademinds<Text style={{ color: '#6B5580' }}>.bmsce</Text>
        </Animated.Text>
      </View>

      {/* ── Click flash overlay ── */}
      <Animated.View style={[styles.flashOverlay, { opacity: flashOp }]} pointerEvents="none" />
    </View>
  );
}

// Lamp geometry constants
const CORD_H = 38;
const SHADE_W = 130;
const SHADE_H = 62;
const BULB_D = 64;
const LAMP_TOP = 0;
const BULB_TOP_Y = LAMP_TOP + CORD_H + SHADE_H - 32; // shade overlaps bulb by 32 (marginTop:-32 in original)

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F0A1C',
    alignItems: 'center',
  },

  // Ambient + cones (positioned relative to bulb area, top:150 in original 844-tall mock)
  ambientGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: H * 0.4,
    backgroundColor: 'transparent',
    shadowColor: '#E8D4A0',
    shadowOpacity: 0.06,
    shadowRadius: 100,
    shadowOffset: { width: 0, height: 60 },
  },
  coneOuter: {
    position: 'absolute',
    top: H * 0.178,
    left: W / 2 - 200,
    width: 400,
    height: 480,
    borderRadius: 200,
    backgroundColor: 'rgba(255,248,220,0.05)',
  },
  coneMid: {
    position: 'absolute',
    top: H * 0.178,
    left: W / 2 - 140,
    width: 280,
    height: 400,
    borderRadius: 140,
    backgroundColor: 'rgba(255,248,220,0.08)',
  },
  coneInner: {
    position: 'absolute',
    top: H * 0.178,
    left: W / 2 - 90,
    width: 180,
    height: 320,
    borderRadius: 90,
    backgroundColor: 'rgba(255,254,240,0.12)',
  },

  // Lamp
  lampWrap: {
    alignItems: 'center',
    marginTop: 48,
  },
  cord: {
    width: 2,
    height: CORD_H,
    backgroundColor: '#2A2535',
  },
  shadeCap: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#1E1428',
    marginBottom: -4,
  },
  // Trapezoid via border trick (clipPath polygon 34%-66% top, 0%-100% bottom)
  shade: {
    width: 0,
    height: 0,
    borderLeftWidth: SHADE_W * 0.34,
    borderRightWidth: SHADE_W * 0.34,
    borderBottomWidth: SHADE_H,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#2A1F38',
  },
  shadeRim: {
    width: SHADE_W + 4,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#1A1226',
    marginTop: -2,
  },
  bulbWrap: {
    marginTop: -32,
    alignItems: 'center',
    height: 64,
  },
  bulbGlow: {
    position: 'absolute',
    top: 0,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,248,220,0.32)',
    transform: [{ translateY: -28 }],
  },
  bulb: {
    width: BULB_D,
    height: BULB_D,
    borderRadius: BULB_D / 2,
  },
  bulbCore: {
    position: 'absolute',
    top: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF8E1',
  },
  pullStringWrap: {
    position: 'absolute',
    top: 57,
    alignItems: 'center',
  },
  pullString: {
    width: 2,
    height: 56,
    backgroundColor: '#3A3142',
  },
  pullTab: {
    width: 11,
    height: 18,
    borderRadius: 6,
    backgroundColor: '#2A2535',
    borderWidth: 1,
    borderColor: '#3A3142',
    marginTop: -1,
  },

  // Particles
  particle: {
    position: 'absolute',
    borderRadius: 2,
    backgroundColor: 'rgba(232,212,160,0.5)',
  },

  // Content
  contentWrap: {
    position: 'absolute',
    top: H * 0.464, // 392/844
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontFamily: 'Georgia',
    fontSize: 44,
    fontWeight: '400',
    color: '#FFFFF0',
    textAlign: 'center',
    letterSpacing: 0.4,
    marginBottom: 14,
  },
  tagline: {
    fontSize: 14,
    letterSpacing: 4.2,
    color: ACCENT,
    marginBottom: 26,
  },
  divider: {
    width: 96,
    height: 1,
    backgroundColor: '#3A3142',
  },

  // Bottom
  bottomWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 54,
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 22,
  },
  btn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#7248D4',
    alignItems: 'center',
    shadowColor: '#7248D4',
    shadowOpacity: 0.45,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  btnPressed: {
    transform: [{ scale: 0.98 }],
  },
  btnText: {
    color: '#EDE5FF',
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0.45,
  },
  subtitle: {
    fontSize: 11,
    letterSpacing: 2.75,
    color: ACCENT,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT,
  },
  domain: {
    fontSize: 10,
    letterSpacing: 0.6,
    color: '#3A2D52',
  },

  // Flash
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: H * 0.45,
    backgroundColor: 'transparent',
    shadowColor: '#FFFAEB',
    shadowOpacity: 0.7,
    shadowRadius: 80,
    shadowOffset: { width: 0, height: 40 },
  },
});
