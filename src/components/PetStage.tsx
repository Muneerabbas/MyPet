import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { ChickenViewer } from './ChickenViewer';
import { MoodBubbles } from './MoodBubbles';

interface PetStageProps {
  pose: string;
  bubbleEmoji?: string | null;
  onPoseComplete?: () => void;
  onPoseStart?: (durationMs: number) => void;
  onTap?: () => void;
}

export const PetStage: React.FC<PetStageProps> = ({
  pose,
  bubbleEmoji,
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
      <MoodBubbles emoji={bubbleEmoji} />
    </View>
  );
};

const styles = StyleSheet.create({
  stage: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
});
