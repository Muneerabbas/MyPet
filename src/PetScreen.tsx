import React, { useEffect, useState } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionButton } from './components/ActionButton';
import { GlassCard } from './components/GlassCard';
import { PetStage } from './components/PetStage';
import { StatBar } from './components/StatBar';
import { TopBar } from './components/TopBar';
import { XPBar } from './components/XPBar';
import { gradients, spacing } from './theme';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import { useDispatch } from 'react-redux';
import { applyOfflineDecay, setLastOpened } from './store/petSlice';
import { feedPet, playPet, sleepPet } from './store/petSlice';
import { ACTION_POSE, DEFAULT_POSE, TAP_POSE } from './petPoses';

const backgroundImage = require('./assets/images/gameBack.png');

export const PetScreen: React.FC = () => {
  const pet = useSelector((state: RootState) => state.pet);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  // Pose is driven only by the action buttons; defaults until one is pressed.
  const [pose, setPose] = useState<string>(DEFAULT_POSE);

  useEffect(() => {
    const now = Date.now();
    const hours = (now - pet.lastOpened) / (1000 * 60);

    dispatch(applyOfflineDecay(hours));
    dispatch(setLastOpened(now));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ImageBackground source={backgroundImage} style={styles.root} resizeMode="cover">
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.sm,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}>
        <View style={styles.header}>
          <TopBar coins={pet.coins} level={pet.level} />

          <GlassCard style={styles.statsCard}>
            <StatBar
              emoji="❤️"
              label="Happiness"
              value={pet.happiness}
              color="#FF7BAC"
              trackColor="#FFD7E6"
            />
            <StatBar
              emoji="🍔"
              label="Hunger"
              value={pet.hunger}
              color="#FFA64D"
              trackColor="#FFE6CC"
            />
            <StatBar
              emoji="⚡"
              label="Energy"
              value={pet.energy}
              color="#5CC8FF"
              trackColor="#D6F1FF"
            />
          </GlassCard>
        </View>

        <View style={styles.stageWrap}>
          <PetStage
            pose={pose}
            onPoseComplete={() => setPose(DEFAULT_POSE)}
            onTap={() => setPose(TAP_POSE)}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.actions}>
            <ActionButton
              icon="🍔"
              label="Feed"
              colors={gradients.feed}
              onPress={() => {
                dispatch(feedPet());
                setPose(ACTION_POSE.feed);
              }}
            />
            <View style={styles.gap} />
            <ActionButton
              icon="🎾"
              label="Play"
              colors={gradients.play}
              onPress={() => {
                dispatch(playPet());
                setPose(ACTION_POSE.play);
              }}
            />
            <View style={styles.gap} />
            <ActionButton
              icon="😴"
              label="Sleep"
              colors={gradients.sleep}
              onPress={() => {
                dispatch(sleepPet());
                setPose(ACTION_POSE.sleep);
              }}
            />
          </View>

          <GlassCard style={styles.xpCard} strong>
            <XPBar xp={pet.xp} message="Your pet is doing okay — keep it up!" />
          </GlassCard>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
  },
  statsCard: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  stageWrap: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  footer: {
    paddingHorizontal: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  gap: {
    width: spacing.md,
  },
  xpCard: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});
