import { useState } from 'react';
import AuthNavigator from './AuthNavigator';
import MainStackNavigator from './MainStackNavigator';

export default function RootNavigator() {
  // Phase 4 only: this flag is a navigation preview, never an authenticated session.
  // Replace with AuthContext in Phase 7. Nothing is persisted across app restarts.
  const [previewEnabled, setPreviewEnabled] = useState(false);

  if (__DEV__ && previewEnabled) {
    return <MainStackNavigator onExitPreview={() => setPreviewEnabled(false)} />;
  }

  return (
    <AuthNavigator
      onEnterPreview={__DEV__ ? () => setPreviewEnabled(true) : undefined}
    />
  );
}
