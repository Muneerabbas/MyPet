import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { Mood } from '../types';

interface PetProps {
  mood: Mood;
  size?: number;
}

/**
 * A cute cat-like blob drawn entirely with Views so its expression can morph
 * with the pet's mood (no image assets required).
 */
export const Pet: React.FC<PetProps> = ({ mood, size = 150 }) => {
  const happy = mood === 'happy';
  const sad = mood === 'sad';

  const eyeSize = happy ? 22 : sad ? 16 : 19;

  return (
    <View style={[styles.root, { width: size, height: size }]}>
      {/* Ears */}
      <View style={[styles.ear, styles.earLeft]}>
        <View style={styles.innerEar} />
      </View>
      <View style={[styles.ear, styles.earRight]}>
        <View style={styles.innerEar} />
      </View>

      {/* Body / head blob */}
      <View style={styles.body}>
        {/* Belly */}
        <View style={styles.belly} />

        {/* Eyebrows (only when sad, angled down to look worried) */}
        {sad && (
          <View style={styles.browRow}>
            <View style={[styles.brow, styles.browLeft]} />
            <View style={[styles.brow, styles.browRight]} />
          </View>
        )}

        {/* Eyes */}
        <View style={[styles.eyeRow, sad && styles.eyeRowSad]}>
          <View
            style={[
              styles.eye,
              { width: eyeSize, height: eyeSize, borderRadius: eyeSize / 2 },
            ]}>
            <View style={styles.sparkle} />
            <View style={styles.sparkleSmall} />
          </View>
          <View
            style={[
              styles.eye,
              { width: eyeSize, height: eyeSize, borderRadius: eyeSize / 2 },
            ]}>
            <View style={styles.sparkle} />
            <View style={styles.sparkleSmall} />
          </View>
        </View>

        {/* Blush cheeks */}
        <View style={styles.cheekRow}>
          <View style={[styles.cheek, happy && styles.cheekHappy]} />
          <View style={[styles.cheek, happy && styles.cheekHappy]} />
        </View>

        {/* Mouth changes with mood */}
        <View style={styles.mouthWrap}>
          {happy && <View style={styles.smile} />}
          {mood === 'neutral' && <View style={styles.neutralMouth} />}
          {sad && <View style={styles.frown} />}
        </View>

        {/* Tear when sad */}
        {sad && <View style={styles.tear} />}
      </View>

      {/* Feet */}
      <View style={styles.feetRow}>
        <View style={styles.foot} />
        <View style={styles.foot} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ear: {
    position: 'absolute',
    top: 6,
    width: 0,
    height: 0,
    borderLeftWidth: 22,
    borderRightWidth: 22,
    borderBottomWidth: 34,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.petEar,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  earLeft: {
    left: 22,
    transform: [{ rotate: '-22deg' }],
  },
  earRight: {
    right: 22,
    transform: [{ rotate: '22deg' }],
  },
  innerEar: {
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderBottomWidth: 17,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.petInnerEar,
    marginBottom: 3,
  },
  body: {
    width: '86%',
    height: '86%',
    borderRadius: 999,
    backgroundColor: colors.petBody,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.petBodyDark,
  },
  belly: {
    position: 'absolute',
    bottom: 6,
    width: '62%',
    height: '58%',
    borderRadius: 999,
    backgroundColor: colors.petBelly,
  },
  browRow: {
    flexDirection: 'row',
    position: 'absolute',
    top: '24%',
    width: '52%',
    justifyContent: 'space-between',
  },
  brow: {
    width: 16,
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.face,
  },
  browLeft: {
    transform: [{ rotate: '18deg' }],
  },
  browRight: {
    transform: [{ rotate: '-18deg' }],
  },
  eyeRow: {
    flexDirection: 'row',
    marginTop: '34%',
    width: '52%',
    justifyContent: 'space-between',
  },
  eyeRowSad: {
    marginTop: '38%',
  },
  eye: {
    backgroundColor: colors.face,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  sparkleSmall: {
    position: 'absolute',
    bottom: 3,
    left: 3,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  cheekRow: {
    flexDirection: 'row',
    width: '74%',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  cheek: {
    width: 16,
    height: 9,
    borderRadius: 8,
    backgroundColor: colors.blush,
    opacity: 0.55,
  },
  cheekHappy: {
    opacity: 0.9,
    width: 18,
    height: 11,
  },
  mouthWrap: {
    marginTop: 3,
    height: 20,
    justifyContent: 'center',
  },
  smile: {
    width: 30,
    height: 16,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.face,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: 'transparent',
  },
  neutralMouth: {
    width: 16,
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.face,
  },
  frown: {
    width: 26,
    height: 14,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.face,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    backgroundColor: 'transparent',
  },
  tear: {
    position: 'absolute',
    top: '46%',
    left: '32%',
    width: 8,
    height: 11,
    borderRadius: 6,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: colors.energy,
    opacity: 0.85,
  },
  feetRow: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    width: '46%',
    justifyContent: 'space-between',
  },
  foot: {
    width: 26,
    height: 16,
    borderRadius: 12,
    backgroundColor: colors.petBodyDark,
  },
});
