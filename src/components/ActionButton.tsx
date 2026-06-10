import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius, shadow } from '../theme';
import { Gradient } from './Gradient';

interface ActionButtonProps {
  icon: string;
  label: string;
  colors: [string, string];
  onPress: () => void;
  /** Stagger index for the entrance animation. */
  index?: number;
}

const SPRING = { damping: 12, stiffness: 220, mass: 0.6 };

const triggerHaptic = () => {
  try {
    ReactNativeHapticFeedback.trigger('impactLight', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
  } catch {
    // Haptics are best-effort; ignore if unavailable.
  }
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  colors: gradientColors,
  onPress,
  index = 0,
}) => {
  const scale = useSharedValue(1);
  const lift = useSharedValue(0);
  const iconScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: lift.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.92, SPRING);
    lift.value = withTiming(3, { duration: 90 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, SPRING);
    lift.value = withSpring(0, SPRING);
  };

  const handlePress = () => {
    triggerHaptic();
    // Playful icon pop on each press.
    iconScale.value = withSequence(
      withSpring(1.28, { damping: 8, stiffness: 260 }),
      withSpring(1, SPRING),
    );
    onPress();
  };

  return (
    <Pressable
      style={styles.pressable}
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}>
      <Animated.View
        entering={FadeInDown.delay(120 + index * 90)
          .duration(420)
          .springify()
          .damping(14)}
        style={[styles.shadowWrap, shadow.soft, animatedStyle]}>
        <Gradient
          colors={gradientColors}
          borderRadius={radius.md}
          style={styles.button}>
          {/* Soft top sheen (thin highlight, no hard edge) */}
          <View style={styles.sheen} pointerEvents="none" />
          <Animated.Text style={[styles.icon, iconStyle]}>{icon}</Animated.Text>
          <Text style={styles.label}>{label}</Text>
        </Gradient>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  shadowWrap: {
    borderRadius: radius.md,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  sheen: {
    position: 'absolute',
    top: 6,
    left: 10,
    right: 10,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  icon: {
    fontSize: 30,
    marginBottom: 4,
  },
  label: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
