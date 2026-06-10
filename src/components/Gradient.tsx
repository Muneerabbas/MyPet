import React, { useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

/**
 * Dependency-free vertical linear gradient.
 *
 * We avoid pulling in a native gradient library (which would require a rebuild)
 * by rendering a stack of thin colour bands that interpolate between two
 * colours. With ~16 bands the banding is imperceptible behind rounded corners
 * and gives buttons/cards a smooth glossy finish.
 */

type RGB = { r: number; g: number; b: number };

function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map(c => c + c)
          .join('')
      : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function mix(a: RGB, b: RGB, t: number): string {
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

interface GradientProps {
  colors: [string, string];
  style?: ViewStyle | ViewStyle[];
  steps?: number;
  borderRadius?: number;
  children?: React.ReactNode;
}

export const Gradient: React.FC<GradientProps> = ({
  colors,
  style,
  steps = 16,
  borderRadius = 0,
  children,
}) => {
  const bands = useMemo(() => {
    const top = hexToRgb(colors[0]);
    const bottom = hexToRgb(colors[1]);
    return Array.from({ length: steps }, (_, i) =>
      mix(top, bottom, i / (steps - 1)),
    );
  }, [colors, steps]);

  // Each band is positioned absolutely as a percentage of the height and is
  // made slightly taller than its slot so consecutive bands overlap. This
  // overlap hides the sub-pixel rounding seams that "flex: 1" bands produce.
  const slice = 100 / steps;

  return (
    <View style={[styles.container, { borderRadius }, style]}>
      <View style={[StyleSheet.absoluteFill, { borderRadius, overflow: 'hidden' }]}>
        {bands.map((color, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${slice * i}%`,
              height: `${slice + 1}%`,
              backgroundColor: color,
            }}
          />
        ))}
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
