import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

export function QGenFAB() {
  const router = useRouter();
  const pathname = usePathname();
  const scale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.6)).current;

  const isOnQGen = pathname === '/explore' || pathname === '/(tabs)/explore';

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.18, duration: 900, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0.15, duration: 900, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0.55, duration: 900, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  if (isOnQGen) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View
        style={[styles.pulseRing, { transform: [{ scale }], opacity: ringOpacity }]}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.navigate('/(tabs)/explore')}
        activeOpacity={0.82}
      >
        <Text style={styles.icon}>⚡</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  pulseRing: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#7C3AED',
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 12,
  },
  icon: {
    fontSize: 18,
  },
});
