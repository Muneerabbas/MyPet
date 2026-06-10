import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing } from '../theme';

type Mood = 'happy' | 'sad' | 'neutral';

interface MoodBoxProps {
  mood: Mood;
  sleeping?: boolean;
}

const MOOD_INFO: Record<Mood, { emoji: string; label: string; color: string }> = {
  happy: { emoji: '❤️', label: 'Happy', color: colors.happiness },
  sad: { emoji: '😢', label: 'Sad', color: colors.energy },
  neutral: { emoji: '🙂', label: 'Okay', color: colors.level },
};

const SLEEPING_INFO = { emoji: '💤', label: 'Sleeping', color: colors.xp };

export const MoodBox: React.FC<MoodBoxProps> = ({ mood, sleeping }) => {
  const info = sleeping ? SLEEPING_INFO : MOOD_INFO[mood];

  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={[styles.box, { borderColor: info.color }]}>
        <Text style={styles.emoji}>{info.emoji}</Text>
        <Text style={[styles.label, { color: info.color }]}>{info.label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: '8%',
    alignSelf: 'center',
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassStrong,
    borderRadius: radius.pill,
    borderWidth: 2,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    ...shadow.soft,
  },
  emoji: {
    fontSize: 18,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
