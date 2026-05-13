import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen
          name="listing/[id]"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#07111e' },
            headerTintColor: '#00c8e0',
            headerTitle: 'Listing Details',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="post-ad"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#07111e' },
            headerTintColor: '#00c8e0',
            headerTitle: 'Post Free Ad',
          }}
        />
        <Stack.Screen
          name="my-ads/index"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#07111e' },
            headerTintColor: '#00c8e0',
            headerTitle: 'My Ads',
          }}
        />
        <Stack.Screen
          name="seller/[id]"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#07111e' },
            headerTintColor: '#00c8e0',
            headerTitle: 'Seller Profile',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </AuthProvider>
  );
}
