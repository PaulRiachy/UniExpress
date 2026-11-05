import PlaceholderScreen from '../../components/common/PlaceholderScreen';

export default function LoginScreen({ navigation, onEnterPreview }) {
  const actions = [
    { label: 'Open Sign Up', onPress: () => navigation.navigate('SignUp') },
  ];
  if (__DEV__ && onEnterPreview) {
    actions.push({ label: 'Enter Development Preview (no login)', onPress: onEnterPreview });
  }

  return (
    <PlaceholderScreen
      title="Login"
      description="Real authentication arrives in Phase 7. Development preview does not sign you in."
      actions={actions}
    />
  );
}
