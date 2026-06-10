import React, { useEffect, useRef, useState } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionButton } from './components/ActionButton';
import { GlassCard } from './components/GlassCard';
import { LevelUpModal } from './components/LevelUpModal';
import { PetStage } from './components/PetStage';
import { StatBar } from './components/StatBar';
import { TopBar } from './components/TopBar';
import { XPBar } from './components/XPBar';
import { gradients, spacing } from './theme';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import { useDispatch } from 'react-redux';
import {
  applyOfflineDecay,
  getMood,
  getStatusMessage,
  setLastOpened,
} from './store/petSlice';
import { feedPet, playPet, sleepPet } from './store/petSlice';
import { ACTION_POSE, DEFAULT_POSE, TAP_POSE } from './petPoses';
import AudioManager, { EffectName } from './services/audioManager';

const COINS_PER_LEVEL = 25;

const backgroundImage = require('./assets/images/gameBack.png');
const DEFAULT_STAT_DURATION = 650;

export const PetScreen: React.FC = () => {
  const pet = useSelector((state: RootState) => state.pet);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const [pose, setPose] = useState<string>(DEFAULT_POSE);

  
  const [statDuration, setStatDuration] = useState(DEFAULT_STAT_DURATION);

  const [levelUp, setLevelUp] = useState<{ level: number; coins: number } | null>(
    null,
  );
  const prevLevel = useRef(pet.level);
  useEffect(() => {
    AudioManager.startMusic();
    AudioManager.preloadEffects();

    return () => {
      AudioManager.release();
    };
  }, []);
  useEffect(() => {
    if (pet.level > prevLevel.current) {
      const gained = pet.level - prevLevel.current;
      AudioManager.playEffect('levelup');
      setLevelUp({ level: pet.level, coins: gained * COINS_PER_LEVEL });
    }
    prevLevel.current = pet.level;
  }, [pet.level]);

  // The stat change is applied when the animation starts, so the bars fill
  // gradually over the same time the model is animating.
  const pendingAction = useRef<(() => void) | null>(null);
  const fallback = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runPendingAction = (durationMs: number) => {
    if (fallback.current) {
      clearTimeout(fallback.current);
      fallback.current = null;
    }
    if (pendingAction.current) {
      const run = pendingAction.current;
      pendingAction.current = null;
      setStatDuration(durationMs);
      run();
    }
  };

  const triggerAction = (
    action: () => void,
    actionPose: string,
    effect: EffectName,
  ) => {
    AudioManager.playEffect(effect);
    pendingAction.current = action;
    setPose(actionPose);

    // Safety net: if the viewer never reports a start, apply after a short wait.
    if (fallback.current) {
      clearTimeout(fallback.current);
    }
    fallback.current = setTimeout(() => runPendingAction(900), 1200);
  };

  const handlePoseStart = (durationMs: number) => {
    runPendingAction(durationMs);
  };

  const handlePoseComplete = () => {
    setPose(DEFAULT_POSE);
    setStatDuration(DEFAULT_STAT_DURATION);
  };

  const mood = getMood(pet);
  const sleeping = pose === ACTION_POSE.sleep;

  useEffect(() => {
    const now = Date.now();
    const hours = (now - pet.lastOpened) / (1000 * 60);

    dispatch(applyOfflineDecay(hours));
    dispatch(setLastOpened(now));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      if (fallback.current) {
        clearTimeout(fallback.current);
      }
    },
    [],
  );

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
              durationMs={statDuration}
            />
            <StatBar
              emoji="🍔"
              label="Hunger"
              value={pet.hunger}
              color="#FFA64D"
              trackColor="#FFE6CC"
              durationMs={statDuration}
            />
            <StatBar
              emoji="⚡"
              label="Energy"
              value={pet.energy}
              color="#5CC8FF"
              trackColor="#D6F1FF"
              durationMs={statDuration}
            />
          </GlassCard>
        </View>

        <View style={styles.stageWrap}>
          <PetStage
            pose={pose}
            mood={mood}
            sleeping={sleeping}
            onPoseComplete={handlePoseComplete}
            onPoseStart={handlePoseStart}
            onTap={() => {
              AudioManager.playEffect('hit');
              setPose(TAP_POSE);
            }}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.actions}>
            <ActionButton
              icon="🍔"
              label="Feed"
              index={0}
              colors={gradients.feed}
              onPress={() =>
                triggerAction(() => dispatch(feedPet()), ACTION_POSE.feed, 'feed')
              }
            />
            <View style={styles.gap} />
            <ActionButton
              icon="🎾"
              label="Play"
              index={1}
              colors={gradients.play}
              onPress={() =>
                triggerAction(() => dispatch(playPet()), ACTION_POSE.play, 'play')
              }
            />
            <View style={styles.gap} />
            <ActionButton
              icon="😴"
              label="Sleep"
              index={2}
              colors={gradients.sleep}
              onPress={() =>
                triggerAction(() => dispatch(sleepPet()), ACTION_POSE.sleep, 'sleep')
              }
            />
          </View>

          <GlassCard style={styles.xpCard} strong>
            <XPBar xp={pet.xp} message={getStatusMessage(pet)} />
          </GlassCard>
        </View>
      </View>

      <LevelUpModal
        visible={levelUp !== null}
        level={levelUp?.level ?? pet.level}
        coinsRewarded={levelUp?.coins ?? COINS_PER_LEVEL}
        onClose={() => setLevelUp(null)}
      />
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
