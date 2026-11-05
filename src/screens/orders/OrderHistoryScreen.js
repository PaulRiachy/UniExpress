import PlaceholderScreen from '../../components/common/PlaceholderScreen';

export default function OrderHistoryScreen({ navigation }) {
  return (
    <PlaceholderScreen
      title="Orders"
      description="Order history will be added later. No orders have been created."
      actions={[
        { label: "Open Order Tracking Preview", onPress: () => navigation.navigate("OrderTracking") },
      ]}
    />
  );
}
