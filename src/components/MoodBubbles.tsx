import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface BubbleProps {
  emoji: string;
  delay: number;
  driftX: number;
}

const Bubble: React.FC<BubbleProps> = ({ emoji, delay, driftX }) => {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 2400, easing: Easing.out(Easing.quad) }),
        -1,
        false,
      ),
    );
  }, [t, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.12, 0.75, 1], [0, 1, 1, 0]),
    transform: [
      { translateY: interpolate(t.value, [0, 1], [0, -90]) },
      { translateX: driftX * Math.sin(t.value * Math.PI) },
      { scale: interpolate(t.value, [0, 0.2, 1], [0.6, 1.1, 0.9]) },
    ],
  }));

  return <Animated.Text style={[styles.bubble, style]}>{emoji}</Animated.Text>;
};

interface MoodBubblesProps {
  emoji?: string | null;
}

export const MoodBubbles: React.FC<MoodBubblesProps> = ({ emoji }) => {
  if (!emoji) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Bubble emoji={emoji} delay={0} driftX={-12} />
      <Bubble emoji={emoji} delay={800} driftX={14} />
      <Bubble emoji={emoji} delay={1600} driftX={-5} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: '12%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 100,
  },
  bubble: {
    position: 'absolute',
    fontSize: 30,
  },
});
