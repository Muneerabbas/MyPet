import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow } from '../theme';

interface TopBarProps {
  coins: number;
  level: number;
}

export const TopBar: React.FC<TopBarProps> = ({ coins, level }) => {
  return (
    <View style={styles.row}>
      <View style={[styles.pill, shadow.soft]}>
        <Text style={styles.emoji}>🪙</Text>
        <Text style={styles.coinText}>{coins}</Text>
      </View>

      <View style={[styles.pill, styles.levelPill, shadow.soft]}>
        <Text style={styles.emoji}>⭐</Text>
        <Text style={styles.levelText}>Level {level}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassStrong,
    borderRadius: radius.pill,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
  },
  levelPill: {
    backgroundColor: 'rgba(255, 244, 224, 0.85)',
  },
  emoji: {
    fontSize: 18,
    marginRight: 7,
  },
  coinText: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.coin,
  },
  levelText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.level,
  },
});
