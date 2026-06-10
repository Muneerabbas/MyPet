import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors, radius, shadow } from '../theme';
import { Mood } from '../types';
import { Pet } from './Pet';

interface PetStageProps {
  mood: Mood;
}

export const PetStage: React.FC<PetStageProps> = ({ mood }) => {
  const float = useSharedValue(0);
  const twinkle = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    twinkle.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [float, twinkle]);

  const petStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(float.value, [0, 1], [6, -10]) }],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: interpolate(float.value, [0, 1], [1, 0.78]) }],
    opacity: interpolate(float.value, [0, 1], [0.28, 0.16]),
  }));

  const twinkleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(twinkle.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(twinkle.value, [0, 1], [0.8, 1.1]) }],
  }));

  return (
    <View style={[styles.platform, shadow.card]}>
      {/* Concentric platform rings */}
      <View style={styles.ringOuter} />
      <View style={styles.ringInner} />

      {/* Decorative floating bits */}
      <Animated.Text style={[styles.cloud, twinkleStyle]}>☁️</Animated.Text>
      <Animated.Text style={[styles.sparkleLeft, twinkleStyle]}>✨</Animated.Text>
      <Animated.Text style={[styles.sparkleRight, twinkleStyle]}>✨</Animated.Text>

      <View style={styles.center}>
        <Animated.View style={petStyle}>
          <Pet mood={mood} size={160} />
        </Animated.View>
        {/* Ground shadow beneath the pet */}
        <Animated.View style={[styles.petShadow, shadowStyle]} />
      </View>
    </View>
  );
};

const SIZE = 280;

const styles = StyleSheet.create({
  platform: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.glassStrong,
    borderWidth: 2,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ringOuter: {
    position: 'absolute',
    width: SIZE - 22,
    height: SIZE - 22,
    borderRadius: (SIZE - 22) / 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  ringInner: {
    position: 'absolute',
    bottom: 26,
    width: SIZE - 70,
    height: SIZE - 120,
    borderRadius: (SIZE - 70) / 2,
    backgroundColor: colors.platform,
    opacity: 0.7,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 30,
  },
  petShadow: {
    width: 120,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.shadow,
    marginTop: 6,
  },
  cloud: {
    position: 'absolute',
    top: 26,
    fontSize: 26,
  },
  sparkleLeft: {
    position: 'absolute',
    top: 70,
    left: 38,
    fontSize: 20,
  },
  sparkleRight: {
    position: 'absolute',
    top: 96,
    right: 40,
    fontSize: 16,
  },
});
