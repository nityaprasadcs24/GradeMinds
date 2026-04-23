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
  const bulbColor     = useRef(new Animated.Value(0)).current; // 0=dark, 1=bright
  const bulbGlow      = useRef(new Animated.Value(0)).current;
  const coreOpacity   = useRef(new Animated.Value(0)).current;
  const coreScale     = useRef(new Animated.Value(0.5)).current;
  const coneOpacity   = useRef(new Animated.Value(0)).current;
  const stringY       = useRef(new Animated.Value(0)).current;  // string pull
  const titleOpacity  = useRef(new Animated.Value(0)).current;
  const titleY        = useRef(new Animated.Value(10)).current;
  const tagOpacity    = useRef(new Animated.Value(0)).current;
  const lineScale     = useRef(new Animated.Value(0)).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;
  const btnOpacity    = useRef(new Animated.Value(0)).current;
  const btnY          = useRef(new Animated.Value(20)).current;

  // Dust particles
  const particles = useRef(
    Array.from({ length: 8 }, () => ({
      opacity: new Animated.Value(0),
      y:       new Animated.Value(0),
      x:       W * 0.45 + Math.random() * W * 0.1,
      startY:  H * 0.2 + Math.random() * H * 0.15,
    }))
  ).current;

  useEffect(() => {
    StatusBar.setHidden(true);

    // String pull at t=1s
    Animated.timing(stringY, {
      toValue: 1, duration: 500, delay: 1000, useNativeDriver: true,
    }).start();

    // Bulb lights up at t=2s
    Animated.parallel([
      Animated.timing(bulbColor, {
        toValue: 1, duration: 2000, delay: 2000, useNativeDriver: false,
      }),
      Animated.timing(bulbGlow, {
        toValue: 1, duration: 2000, delay: 2000, useNativeDriver: false,
      }),
      Animated.timing(coneOpacity, {
        toValue: 1, duration: 2500, delay: 1500, useNativeDriver: true,
      }),
    ]).start();

    // Bulb core
    Animated.parallel([
      Animated.timing(coreOpacity, {
        toValue: 1, duration: 1500, delay: 2500, useNativeDriver: true,
      }),
      Animated.spring(coreScale, {
        toValue: 1, delay: 2500, useNativeDriver: true,
      }),
    ]).start();

    // Title fades in
    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1, duration: 1500, delay: 2500, useNativeDriver: true,
      }),
      Animated.timing(titleY, {
        toValue: 0, duration: 1500, delay: 2500, useNativeDriver: true,
      }),
    ]).start();

    // Tagline
    Animated.timing(tagOpacity, {
      toValue: 1, duration: 1200, delay: 3000, useNativeDriver: true,
    }).start();

    // Decorative line
    Animated.timing(lineScale, {
      toValue: 1, duration: 800, delay: 3500, useNativeDriver: true,
    }).start();

    // Bottom text + dots
    Animated.timing(bottomOpacity, {
      toValue: 1, duration: 1200, delay: 3500, useNativeDriver: true,
    }).start();

    // Show button after 5s
    const btnTimer = setTimeout(() => {
      setShowButton(true);
      Animated.parallel([
        Animated.timing(btnOpacity, {
          toValue: 1, duration: 600, useNativeDriver: true,
        }),
        Animated.timing(btnY, {
          toValue: 0, duration: 600, useNativeDriver: true,
        }),
      ]).start();
    }, 5000);

    // Dust particles
    particles.forEach((p, i) => {
      const loop = () => {
        p.opacity.setValue(0);
        p.y.setValue(0);
        Animated.parallel([
          Animated.sequence([
            Animated.timing(p.opacity, {
              toValue: 0.7, duration: 800, delay: 2500 + i * 200, useNativeDriver: true,
            }),
            Animated.timing(p.opacity, {
              toValue: 0, duration: (4000 + Math.random() * 2000) - 800, useNativeDriver: true,
            }),
          ]),
          Animated.timing(p.y, {
            toValue: 80 + Math.random() * 40,
            duration: 4000 + Math.random() * 2000,
            delay: 2500 + i * 200,
            useNativeDriver: true,
          }),
        ]).start(() => loop());
      };
      loop();
    });

    return () => {
      clearTimeout(btnTimer);
      StatusBar.setHidden(false);
    };
  }, []);

  const bulbBgColor = bulbColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['#2A1F38', '#E8D4A0'],
  });

  const bulbShadowRadius = bulbGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 40],
  });

  const stringHeight = stringY.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 60],
  });

  const tabY = stringY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  return (
    <View style={styles.root}>
      {/* ── Lamp ── */}
      <View style={styles.lampContainer}>
        {/* Ceiling cord */}
        <View style={styles.cord} />

        {/* Lampshade */}
        <View style={styles.shadeWrap}>
          <View style={styles.shadeCap} />
          <View style={styles.shadeBody} />
          <View style={styles.shadeRim} />
        </View>

        {/* Bulb */}
        <View style={styles.bulbWrap}>
          <Animated.View
            style={[
              styles.bulb,
              {
                backgroundColor: bulbBgColor,
                shadowColor: '#E8D4A0',
                shadowRadius: bulbShadowRadius,
                shadowOpacity: 0.6,
                shadowOffset: { width: 0, height: 0 },
                elevation: 20,
              },
            ]}
          >
            {/* Inner core */}
            <Animated.View
              style={[
                styles.bulbCore,
                { opacity: coreOpacity, transform: [{ scale: coreScale }] },
              ]}
            />
          </Animated.View>

          {/* Pull string */}
          <Animated.View style={[styles.pullString, { height: stringHeight }]} />
          <Animated.View style={[styles.pullTab, { transform: [{ translateY: tabY }] }]} />
        </View>

        {/* Light cone */}
        <Animated.View style={[styles.cone, { opacity: coneOpacity }]} />
        <Animated.View style={[styles.coneInner, { opacity: coneOpacity }]} />
        <Animated.View style={[styles.coneCenter, { opacity: coneOpacity }]} />
      </View>

      {/* ── Dust particles ── */}
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              left: p.x,
              top: p.startY,
              opacity: p.opacity,
              transform: [{ translateY: p.y }],
            },
          ]}
        />
      ))}

      {/* ── Main content ── */}
      <View style={styles.content}>
        <Animated.Text
          style={[
            styles.title,
            { opacity: titleOpacity, transform: [{ translateY: titleY }] },
          ]}
        >
          GradeMinds
        </Animated.Text>

        <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
          THINK ALIKE
        </Animated.Text>

        <Animated.View
          style={[
            styles.line,
            { opacity: tagOpacity, transform: [{ scaleX: lineScale }] },
          ]}
        />
      </View>

      {/* ── Bottom section ── */}
      <Animated.View style={[styles.bottom, { opacity: bottomOpacity }]}>
        <Text style={styles.subtitle}>WHERE LEARNING FINDS ITS LIGHT</Text>

        {showButton && (
          <Animated.View
            style={{ opacity: btnOpacity, transform: [{ translateY: btnY }], width: '100%' }}
          >
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

        {/* Dots */}
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === 0 ? '#8B6BA8' : '#4A3B5C' },
              ]}
            />
          ))}
        </View>
      </Animated.View>

      {/* Ambient room glow */}
      <View style={styles.ambientGlow} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F0A1C',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 48,
    overflow: 'hidden',
  },

  // Lamp
  lampContainer: {
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: W / 2 - 80,
    width: 160,
  },
  cord: {
    width: 2,
    height: 64,
    backgroundColor: '#2A2535',
    marginTop: 0,
  },
  shadeWrap: { alignItems: 'center' },
  shadeCap: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#1E1428', marginBottom: -4,
  },
  shadeBody: {
    width: 120, height: 60,
    backgroundColor: '#2A1F38',
    // trapezoid via border trick
    borderLeftWidth: 20, borderRightWidth: 20,
    borderBottomWidth: 60,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderBottomColor: '#2A1F38',
    width: 0, height: 0,
    borderStyle: 'solid',
  },
  shadeRim: {
    width: 128, height: 3,
    backgroundColor: '#1A1226',
    marginTop: -4,
  },
  bulbWrap: { alignItems: 'center', marginTop: 4 },
  bulb: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
  },
  bulbCore: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFF8E1',
  },
  pullString: {
    width: 2, backgroundColor: '#3A3142',
    marginTop: 2,
  },
  pullTab: {
    width: 12, height: 20, borderRadius: 6,
    backgroundColor: '#2A2535',
    borderWidth: 1, borderColor: '#3A3142',
    marginTop: 2,
  },

  // Light cones
  cone: {
    position: 'absolute',
    top: 145,
    left: -200,
    width: 400, height: 600,
    borderRadius: 200,
    backgroundColor: 'transparent',
    shadowColor: '#FFFADC',
    shadowOpacity: 0.08,
    shadowRadius: 80,
    shadowOffset: { width: 0, height: 0 },
  },
  coneInner: {
    position: 'absolute',
    top: 145,
    left: -130,
    width: 260, height: 500,
    borderRadius: 130,
    shadowColor: '#FFFADC',
    shadowOpacity: 0.12,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
  },
  coneCenter: {
    position: 'absolute',
    top: 145,
    left: -70,
    width: 140, height: 400,
    borderRadius: 70,
    shadowColor: '#FFFEF0',
    shadowOpacity: 0.18,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
  },

  // Particle
  particle: {
    position: 'absolute',
    width: 3, height: 3, borderRadius: 1.5,
    backgroundColor: 'rgba(232, 212, 160, 0.6)',
  },

  // Content
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 160,
    paddingHorizontal: 32,
    zIndex: 10,
  },
  title: {
    fontSize: 48,
    color: '#FFFFF0',
    fontFamily: 'Georgia',
    fontWeight: '400',
    letterSpacing: 1,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 12,
    color: '#8B6BA8',
    letterSpacing: 8,
    marginBottom: 20,
  },
  line: {
    width: 96, height: 1,
    backgroundColor: '#3A3142',
  },

  // Bottom
  bottom: {
    alignItems: 'center',
    gap: 16,
    width: '100%',
    paddingHorizontal: 32,
    zIndex: 10,
  },
  subtitle: {
    fontSize: 10,
    color: '#8B6BA8',
    letterSpacing: 4,
  },
  btn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: '#7248D4',
    alignItems: 'center',
    shadowColor: '#7248D4',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  btnText: {
    color: '#EDE5FF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  domain: {
    fontSize: 10,
    color: '#3A2D52',
    letterSpacing: 2,
  },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },

  // Ambient
  ambientGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    shadowColor: '#E8D4A0',
    shadowOpacity: 0.05,
    shadowRadius: 200,
    shadowOffset: { width: 0, height: 100 },
  },
});
