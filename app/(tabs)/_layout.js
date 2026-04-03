import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      tabBarStyle: { backgroundColor: '#C2B39A', borderTopWidth: 0, height: 60 },
      tabBarActiveTintColor: '#fff',
      tabBarInactiveTintColor: '#4A4A4A',
      headerShown: false, 
    }}>
      <Tabs.Screen name="index" options={{ title: '主頁', tabBarIcon: ({color}) => <Ionicons name="home" size={24} color={color}/> }} />
      <Tabs.Screen name="list" options={{ title: '清單', tabBarIcon: ({color}) => <Ionicons name="list" size={24} color={color}/> }} />
      <Tabs.Screen name="profile" options={{ title: '我的', tabBarIcon: ({color}) => <Ionicons name="person" size={24} color={color}/> }} />
    </Tabs>
  );
}