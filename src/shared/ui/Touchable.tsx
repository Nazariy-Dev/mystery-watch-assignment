import { Pressable, type GestureResponderEvent, type PressableProps } from 'react-native';

import { playTapFeedback, type TapFeedback } from '../lib/tapFeedback';

type TouchableProps = PressableProps & {
  /** What the tap means, which picks its click and haptic. A disabled control always answers with `denied`. */
  feedback?: Exclude<TapFeedback, 'denied'>;
};

/**
 * Pressable that clicks and ticks the instant the finger lands, while the action still waits for release
 * (sliding off cancels it). Inside scrolling lists pass `unstable_pressDelay`, so starting a scroll stays silent.
 *
 * A disabled Touchable still takes the touch, only to answer with a dull `denied` thud instead of a dead tap;
 * it never shows the pressed state or runs `onPress`.
 */
export function Touchable({ feedback = 'confirm', disabled, onPressIn, onPress, style, accessibilityState, ...props }: TouchableProps) {
  const pressIn = (event: GestureResponderEvent) => {
    playTapFeedback(disabled ? 'denied' : feedback);
    if (!disabled) onPressIn?.(event);
  };
  const press = (event: GestureResponderEvent) => {
    if (!disabled) onPress?.(event);
  };

  return (
    <Pressable
      // Our own click already sounds; Android's system touch sound would play on top of it.
      android_disableSound
      {...props}
      accessibilityState={{ ...accessibilityState, disabled: !!disabled }}
      onPressIn={pressIn}
      onPress={press}
      style={disabled && typeof style === 'function' ? (state) => style({ ...state, pressed: false }) : style}
    />
  );
}
