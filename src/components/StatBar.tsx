import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
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
  const [display, setDisplay] = useState(Math.round(clamp(value)));

  useEffect(() => {
    progress.value = withTiming(clamp(value), {
      duration: durationMs,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, durationMs, progress]);

  // Keep the % label in sync with the animated fill.
  useAnimatedReaction(
    () => Math.round(progress.value),
    (current, previous) => {
      if (current !== previous) {
        runOnJS(setDisplay)(current);
      }
    },
    [],
  );

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>{display}%</Text>
      </View>

      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <Animated.View style={[styles.fill, { backgroundColor: color }, fillStyle]}>
          {/* Glossy top sheen on the fill */}
          <View style={styles.fillSheen} pointerEvents="none" />
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
    marginBottom: 6,
  },
  emoji: {
    fontSize: 16,
    marginRight: 7,
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
});
