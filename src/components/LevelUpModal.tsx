import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius, shadow, spacing } from '../theme';
import { Gradient } from './Gradient';

interface LevelUpModalProps {
  visible: boolean;
  level: number;
  coinsRewarded: number;
  onClose: () => void;
}

const SPARKLES = ['✨', '⭐', '🎉', '💫', '🌟', '✨'];

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  visible,
  level,
  coinsRewarded,
  onClose,
}) => {
  const backdrop = useSharedValue(0);
  const card = useSharedValue(0);
  const badgeSpin = useSharedValue(0);
  const badgePulse = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      backdrop.value = withTiming(1, { duration: 220 });
      card.value = withDelay(
        80,
        withSpring(1, { damping: 11, stiffness: 180, mass: 0.7 }),
      );
      badgeSpin.value = withDelay(
        160,
        withSequence(
          withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) }),
          withTiming(1, { duration: 0 }),
        ),
      );
      badgePulse.value = withDelay(
        160,
        withRepeat(
          withSequence(
            withTiming(1.08, { duration: 700, easing: Easing.inOut(Easing.quad) }),
            withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }),
          ),
          -1,
          false,
        ),
      );
    } else {
      backdrop.value = 0;
      card.value = 0;
      badgeSpin.value = 0;
      badgePulse.value = 1;
    }
  }, [visible, backdrop, card, badgeSpin, badgePulse]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: card.value,
    transform: [
      { scale: 0.8 + card.value * 0.2 },
      { translateY: (1 - card.value) * 24 },
    ],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: badgePulse.value },
      { rotate: `${badgeSpin.value * 360}deg` },
    ],
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View style={[styles.card, shadow.card, cardStyle]}>
          <View style={styles.sparkleRow} pointerEvents="none">
            {SPARKLES.map((s, i) => (
              <Sparkle key={i} emoji={s} delay={i * 110} />
            ))}
          </View>

          <Animated.View style={[styles.badge, badgeStyle]}>
            <Gradient
              colors={[colors.coin, colors.level]}
              borderRadius={radius.pill}
              style={styles.badgeInner}>
              <Text style={styles.badgeStar}>⭐</Text>
            </Gradient>
          </Animated.View>

          <Text style={styles.title}>Level Up!</Text>
          <Text style={styles.subtitle}>
            You reached <Text style={styles.levelNum}>Level {level}</Text>
          </Text>

          <View style={styles.rewardPill}>
            <Text style={styles.rewardEmoji}>🪙</Text>
            <Text style={styles.rewardText}>+{coinsRewarded} coins</Text>
          </View>

          <Pressable onPress={onClose} style={({ pressed }) => [pressed && styles.btnPressed]}>
            <Gradient
              colors={[colors.xp, '#7C6CFF']}
              borderRadius={radius.md}
              style={styles.button}>
              <Text style={styles.buttonText}>Awesome!</Text>
            </Gradient>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const Sparkle: React.FC<{ emoji: string; delay: number }> = ({ emoji, delay }) => {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 0 }),
        ),
        -1,
        false,
      ),
    );
  }, [t, delay]);

  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.15 ? t.value / 0.15 : 1 - (t.value - 0.15) / 0.85,
    transform: [{ translateY: -t.value * 14 }, { scale: 0.7 + t.value * 0.5 }],
  }));

  return <Animated.Text style={[styles.sparkle, style]}>{emoji}</Animated.Text>;
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(40, 30, 70, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
  },
  sparkleRow: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
  },
  sparkle: {
    fontSize: 20,
  },
  badge: {
    marginBottom: spacing.md,
  },
  badgeInner: {
    width: 84,
    height: 84,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  badgeStar: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSoft,
  },
  levelNum: {
    color: colors.level,
    fontWeight: '900',
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 244, 224, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 197, 61, 0.4)',
  },
  rewardEmoji: {
    fontSize: 18,
    marginRight: 7,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.coin,
  },
  button: {
    marginTop: spacing.lg,
    paddingVertical: 14,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  buttonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  btnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
});
