import PlaceholderScreen from '../../components/common/PlaceholderScreen';

export default function CartScreen({ navigation }) {
  return (
    <PlaceholderScreen
      title="Cart"
      description="The cart is not implemented. Explore the checkout screen preview."
      actions={[
        { label: "Open Checkout Preview", onPress: () => navigation.navigate("Checkout") },
      ]}
    />
  );
}
