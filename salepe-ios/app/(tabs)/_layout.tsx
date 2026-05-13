import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const ACCENT = '#00c8e0';
const HEADER_BG = '#07111e';
const TAB_BG = '#07111e';
const INACTIVE = 'rgba(255,255,255,0.4)';

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={{ fontSize: 22, opacity: color === INACTIVE ? 0.5 : 1 }}>{emoji}</Text>;
}

export default function TabLayout() {
  const { isLoggedIn } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: TAB_BG,
          borderTopColor: 'rgba(255,255,255,0.08)',
          borderTopWidth: 1,
        },
        headerStyle: { backgroundColor: HEADER_BG },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} />,
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
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color }) => <TabIcon emoji="❤️" color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <TabIcon emoji="💬" color={color} />,
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
