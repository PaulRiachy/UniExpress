import PlaceholderScreen from '../../components/common/PlaceholderScreen';

export default function ProfileScreen({ navigation, onExitPreview }) {
  return (
    <PlaceholderScreen
      title="Profile"
      description="Development-only preview. No user profile or authentication session exists."
      actions={[
        { label: 'Open Wallet Preview', onPress: () => navigation.navigate('Wallet') },
        { label: 'Open Saved Locations Preview', onPress: () => navigation.navigate('SavedLocations') },
        { label: 'Exit Development Preview', onPress: onExitPreview },
      ]}
    />
  );
}
