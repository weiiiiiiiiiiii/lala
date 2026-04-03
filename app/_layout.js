import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 告訴系統先載入 (tabs) 群組 */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}