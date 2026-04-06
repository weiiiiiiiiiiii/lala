import React from 'react';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


import HomeIcon from '../../assets/images/home_icon.svg';
import ListIcon from '../../assets/images/list_icon.svg';
import UserIcon from '../../assets/images/user_icon.svg';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const Colors = {
    bg: '#A79E8D',     
    active: '#F3C0BA',  
    inactive: '#9E554D', 
  };

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.bg,
          borderTopWidth: 0,
          height: 50 + insets.bottom,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: Colors.active,
        tabBarInactiveTintColor: Colors.inactive,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: insets.bottom > 0 ? 0 : 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '主頁',
          tabBarIcon: ({ focused }) => {
            const color = focused ? Colors.active : Colors.inactive;
            return (
              <View style={{ marginTop: 8 }}>
                <HomeIcon 
                  key={`home-${focused}`}
                  width={24} 
                  height={24} 
                  stroke={color} 
                  color={color} 
                  fill="none" 
                />
              </View>
            );
          },
        }}
      />

      <Tabs.Screen
        name="list"
        options={{
          title: '清單',
          tabBarIcon: ({ focused }) => {
            const color = focused ? Colors.active : Colors.inactive;
            return (
              <View style={{ marginTop: 8 }}>
                <ListIcon 
                  key={`list-${focused}`}
                  width={24} 
                  height={24} 
                  stroke={color} 
                  color={color} 
                  fill="none" 
                />
              </View>
            );
          },
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ focused }) => {
            const color = focused ? Colors.active : Colors.inactive;
            return (
              <View style={{ marginTop: 8 }}>
                <UserIcon 
                  key={`user-${focused}`}
                  width={24} 
                  height={24} 
                  stroke={color} 
                  color={color} 
                  fill="none" 
                />
              </View>
            );
          },
        }}
      />
    </Tabs>
  );
}