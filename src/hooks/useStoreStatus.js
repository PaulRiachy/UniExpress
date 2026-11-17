import { useCallback, useState } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getStoreStatus } from '../utils/campusTime.js';

// One clock per focused screen, shared by every store card and the delivery banner.
export default function useStoreStatus() {
  const [now, setNow] = useState(() => new Date());
  useFocusEffect(useCallback(() => {
    const refresh = () => setNow(new Date());
    refresh();
    const timer = setInterval(() => {
      if (AppState.currentState === 'active') refresh();
    }, 15000);
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') refresh();
    });
    return () => { clearInterval(timer); subscription.remove(); };
  }, []));
  return { now, statusFor: store => getStoreStatus(store, now) };
}
