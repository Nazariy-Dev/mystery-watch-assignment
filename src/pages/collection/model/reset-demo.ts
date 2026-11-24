import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';

import { useResetDemoMutation } from '@/entities/player';
import type { ApiErrorBody } from '@/shared/api';

/** The demo reset behind a confirmation; a failed reset says so instead of silently leaving the vault as it was. */
export function useResetDemo() {
  const [resetDemo, { isLoading: resetting }] = useResetDemoMutation();

  const reset = async () => {
    try {
      await resetDemo().unwrap();
    } catch (failure) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Reset failed',
        (failure as { data?: Partial<ApiErrorBody> }).data?.message ?? 'Something went wrong. Please try again.',
      );
    }
  };

  const confirmReset = () =>
    Alert.alert('Reset demo?', 'Your vault is emptied and your balance goes back to the starting amount.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: reset },
    ]);

  return { confirmReset, resetting };
}
