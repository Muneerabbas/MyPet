import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius } from '../theme';

interface XPBarProps {
  xp: number; // 0..100
  message: string;
}

export const XPBar: React.FC<XPBarProps> = ({ xp, message }) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const progress = useSharedValue(0);

  const clampedXp = Math.max(0, Math.min(100, xp));

  useEffect(() => {
    progress.value = withTiming(clampedXp / 100, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
  }, [clampedXp, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: progress.value * trackWidth,
  }));

  const onTrackLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.xpLabel}>XP</Text>
        <Text style={styles.xpValue}>{Math.round(clampedXp)}%</Text>
      </View>
      <View style={styles.track} onLayout={onTrackLayout}>
        <Animated.View style={[styles.fill, fillStyle]}>
          <View style={styles.sheen} pointerEvents="none" />
        </Animated.View>
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  xpLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.xp,
    letterSpacing: 1,
  },
  xpValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.xp,
  },
  track: {
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.xpSoft,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.xp,
  },
  sheen: {
    position: 'absolute',
    top: 2,
    left: 6,
    right: 6,
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  message: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSoft,
  },
});
