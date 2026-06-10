import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
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
}

const SPRING = { damping: 12, stiffness: 220, mass: 0.6 };

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  colors: gradientColors,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const lift = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: lift.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.92, SPRING);
    lift.value = withTiming(3, { duration: 90 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, SPRING);
    lift.value = withSpring(0, SPRING);
  };

  return (
    <Pressable
      style={styles.pressable}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}>
      <Animated.View style={[styles.shadowWrap, shadow.soft, animatedStyle]}>
        <Gradient
          colors={gradientColors}
          borderRadius={radius.md}
          style={styles.button}>
          {/* Glossy highlight */}
          <View style={styles.gloss} pointerEvents="none" />
          <Text style={styles.icon}>{icon}</Text>
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
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
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
