import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { ChickenViewer } from './ChickenViewer';

interface PetStageProps {
  pose: string;
  onPoseComplete?: () => void;
  onTap?: () => void;
}

export const PetStage: React.FC<PetStageProps> = ({
  pose,
  onPoseComplete,
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
        onTap={onTap}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  stage: {
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
});
