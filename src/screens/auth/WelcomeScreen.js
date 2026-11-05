import PlaceholderScreen from '../../components/common/PlaceholderScreen';

export default function WelcomeScreen({ navigation }) {
  return (
    <PlaceholderScreen
      title="UniExpress"
      description="Campus Delivery Application"
      actions={[
        { label: "Open Login", onPress: () => navigation.navigate("Login") },
        { label: "Open Sign Up", onPress: () => navigation.navigate("SignUp") },
      ]}
    />
  );
}
