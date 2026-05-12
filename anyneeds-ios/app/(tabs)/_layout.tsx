import { Tabs } from 'expo-router';
import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ACCENT = '#00c8e0';
const BG = '#0a1628';
const INACTIVE = '#556080';

export default function TabLayout() {
  const { isLoggedIn } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: '#0f1e3a',
          borderTopColor: '#1e3060',
          borderTopWidth: 1,
        },
        headerStyle: { backgroundColor: BG },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <TabIcon emoji="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color }) => <TabIcon emoji="🔍" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: isLoggedIn ? 'Profile' : 'Login',
          tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 22, opacity: color === INACTIVE ? 0.5 : 1 }}>{emoji}</Text>;
}
