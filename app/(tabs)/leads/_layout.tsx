import { Stack } from 'expo-router';

export default function LeadsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="details" />
      <Stack.Screen name="form" />
    </Stack>
  );
}