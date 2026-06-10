import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, shadow } from '../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  strong?: boolean;
}

/**
 * Frosted-glass surface: translucent fill, bright hairline border and a soft
 * drop shadow to lift it off the pastel backdrop.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  strong,
}) => {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: strong ? colors.glassStrong : colors.glass },
        shadow.card,
        style,
      ]}>
      {/* Top sheen highlight for the glassy look */}
      <View style={styles.sheen} pointerEvents="none" />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
});
