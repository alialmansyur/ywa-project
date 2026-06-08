import { Stack } from 'expo-router';

export default function UtilityLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="notifications" />
      <Stack.Screen name="scanner" />
    </Stack>
  );
}
