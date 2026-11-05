import PlaceholderScreen from '../../components/common/PlaceholderScreen';

export default function SignUpScreen({ navigation }) {
  return (
    <PlaceholderScreen
      title="Sign Up"
      description="Registration will be added in Phase 7."
      actions={[
        { label: "Back to Login", onPress: () => navigation.popTo("Login") },
      ]}
    />
  );
}
