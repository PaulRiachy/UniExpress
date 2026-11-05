import PlaceholderScreen from '../../components/common/PlaceholderScreen';

export default function StoreScreen({ navigation }) {
  return (
    <PlaceholderScreen
      title="Store"
      description="Store browsing will be added later. No catalog data is loaded."
      actions={[
        { label: "Open Product Details Preview", onPress: () => navigation.navigate("ProductDetails") },
      ]}
    />
  );
}
