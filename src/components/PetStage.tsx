import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { ChickenViewer } from './ChickenViewer';
import { MoodBox } from './MoodBox';

interface PetStageProps {
  pose: string;
  mood: 'happy' | 'sad' | 'neutral';
  sleeping?: boolean;
  onPoseComplete?: () => void;
  onPoseStart?: (durationMs: number) => void;
  onTap?: () => void;
}

export const PetStage: React.FC<PetStageProps> = ({
  pose,
  mood,
  sleeping,
  onPoseComplete,
  onPoseStart,
  onTap,
}) => {
  const { width } = useWindowDimensions();
  const stageHeight = Math.round(width * 0.72);

  return (
    <View style={[styles.stage, { width, height: stageHeight }]}>
      <ChickenViewer
        pose={pose}
        width={width}
        height={stageHeight}
        onPoseComplete={onPoseComplete}
        onPoseStart={onPoseStart}
        onTap={onTap}
      />
      <MoodBox mood={mood} sleeping={sleeping} />
    </View>
  );
};

const styles = StyleSheet.create({
  stage: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
});
