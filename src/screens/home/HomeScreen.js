import PlaceholderScreen from '../../components/common/PlaceholderScreen';

export default function HomeScreen({ navigation }) {
  return (
    <PlaceholderScreen
      title="Home"
      description="Development-only preview. No account is signed in."
      actions={[
        { label: "Open Store Preview", onPress: () => navigation.navigate("Store") },
        { label: "Open Printing Preview", onPress: () => navigation.navigate("Printing") },
      ]}
    />
  );
}
