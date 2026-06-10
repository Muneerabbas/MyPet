/** Pose shown when idle (no action playing). */
export const DEFAULT_POSE = 'static';

/** Pose played when the chicken itself is tapped. */
export const TAP_POSE = 'flap';

/** Pose played when each action button is pressed. */
export const ACTION_POSE = {
  feed: 'peck_idle2',
  play: 'bounce',
  sleep: 'idle01_water',
} as const;
