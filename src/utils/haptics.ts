import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';

const OPTIONS = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const trigger = (type: keyof typeof HapticFeedbackTypes) => {
  try {
    ReactNativeHapticFeedback.trigger(type, OPTIONS);
  } catch {
    // Haptics are best-effort; ignore if unavailable.
  }
};

/** Light tap for standard button presses. */
export const hapticTap = () => trigger('impactLight');

/** Stronger thud for hitting / tapping the chick. */
export const hapticHit = () => trigger('impactHeavy');
