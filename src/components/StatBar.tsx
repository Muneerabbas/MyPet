import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius } from '../theme';

interface StatBarProps {
  emoji: string;
  label: string;
  value: number; // 0..100
  color: string;
  trackColor: string;
  durationMs?: number;
}

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export const StatBar: React.FC<StatBarProps> = ({
  emoji,
  label,
  value,
  color,
  trackColor,
  durationMs = 650,
}) => {
  const progress = useSharedValue(0);
  const sheenOpacity = useSharedValue(0);
  const [display, setDisplay] = React.useState(Math.round(clamp(value)));
  const prevValue = useRef(value);

  useEffect(() => {
    const clamped = clamp(value);
    const gained = value > prevValue.current;
    progress.value = withTiming(clamped, {
      duration: durationMs,
      easing: Easing.out(Easing.cubic),
    });
    if (gained) {
      sheenOpacity.value = withSequence(
        withTiming(1, { duration: 120 }),
        withTiming(0, { duration: 500 }),
      );
    }
    prevValue.current = value;
  }, [value, durationMs, progress, sheenOpacity]);

  useAnimatedReaction(
    () => Math.round(progress.value),
    (current, previous) => {
      if (current !== previous) {
        runOnJS(setDisplay)(current);
      }
    },
    [],
  );

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value}%` }));
  const sheenStyle = useAnimatedStyle(() => ({ opacity: sheenOpacity.value }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>{display}%</Text>
      </View>

      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View style={[styles.fill, { backgroundColor: color }, fillStyle]}>
          <View style={styles.fillSheen} pointerEvents="none" />
          <Animated.View style={[styles.flashOverlay, sheenStyle]} pointerEvents="none" />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 6,
  },
  emoji: {
    fontSize: 16,
  },
  label: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.text,
  },
  value: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  track: {
    height: 14,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    minWidth: 14,
  },
  fillSheen: {
    position: 'absolute',
    top: 2,
    left: 6,
    right: 6,
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: radius.pill,
  },
});
