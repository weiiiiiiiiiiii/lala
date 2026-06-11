import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* 告訴系統先載入 (tabs) 群組 */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}