import React, { useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

import { ActionButton } from './components/ActionButton';
import { Gradient } from './components/Gradient';
import { GlassCard } from './components/GlassCard';
import { PetStage } from './components/PetStage';
import { StatBar } from './components/StatBar';
import { TopBar } from './components/TopBar';
import { XPBar } from './components/XPBar';
import { colors, gradients, spacing } from './theme';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import { useDispatch } from 'react-redux';
import { decayStats, getMood } from './store/petSlice';
import {
  feedPet,
  playPet,
  sleepPet,
} from './store/petSlice';

const haptic = () => {
  try {
    ReactNativeHapticFeedback.trigger('impactMedium', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
  } catch {

  }
};

export const PetScreen: React.FC = () => {

  const pet = useSelector(
    (state: RootState) => state.pet,
  );
  const dispatch = useDispatch();

  const insets = useSafeAreaInsets();
  const mood = getMood(pet);
  useEffect(() => {
    const timer = setInterval(() => {
      dispatch(decayStats());
    }, 10000);
  
    return () => clearInterval(timer);
  }, []);
  return (
    <View style={styles.root}>
      {/* Pastel backdrop */}
      <Gradient
        colors={[colors.bgTop, colors.bgBottom]}
        steps={24}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg },
        ]}>
        {/* Top: coins + level */}
        <TopBar coins={pet.coins} level={pet.level} />
      
        {/* Stats */}
        <GlassCard style={styles.statsCard}>
          <StatBar
            emoji="❤️"
            label="Happiness"
            value={pet.happiness}
            color={colors.happiness}
            trackColor={colors.happinessSoft}
          />
          <StatBar
            emoji="🍔"
            label="Hunger"
            value={pet.hunger}
            color={colors.hunger}
            trackColor={colors.hungerSoft}
          />
          <StatBar
            emoji="⚡"
            label="Energy"
            value={pet.energy}
            color={colors.energy}
            trackColor={colors.energySoft}
          />
        </GlassCard>

        {/* Pet */}
        <View style={styles.stageWrap}>
          <PetStage mood={mood} />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <ActionButton
            icon="🍔"
            label="Feed"
            colors={gradients.feed}
            onPress={() => dispatch(feedPet())}
          />
          <View style={styles.gap} />
          <ActionButton
            icon="🎾"
            label="Play"
            colors={gradients.play}
            onPress={() => dispatch(playPet())}
          />
          <View style={styles.gap} />
          <ActionButton
            icon="😴"
            label="Sleep"
            colors={gradients.sleep}
            onPress={() => dispatch(sleepPet())}
          />
        </View>

        {/* Bottom: XP + message */}
        <GlassCard style={styles.xpCard} strong>
          <XPBar xp={pet.xp} message={'Your pet is doing okay — keep it up!'} />
        </GlassCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgMid,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  statsCard: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  stageWrap: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  gap: {
    width: spacing.md,
  },
  xpCard: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});
