import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';

const C = {
  bg: '#f5f7fa', card: '#ffffff', border: 'rgba(0,0,0,0.09)',
  accent: '#00c8e0', accentDark: '#07111e',
  text: '#1e293b', textSub: '#475569', textMuted: '#94a3b8',
  error: '#ef4444', success: '#22c55e', warning: '#f97316',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isLoggedIn, logout, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isLoggedIn) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>👤</Text>
        <Text style={{ color: C.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Login to SalePe</Text>
        <Text style={{ color: C.textSub, fontSize: 14, marginBottom: 28, textAlign: 'center', lineHeight: 20 }}>
          Login to post ads, save listings, chat with sellers, and manage your account
        </Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => router.push('/login' as any)}>
          <Text style={s.primaryBtnText}>Login with Mobile OTP</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await authApi.updateProfile({ name, email });
      updateUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.profileHeader}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>
            {(user?.name || user?.phoneNumber || 'U')[0].toUpperCase()}
          </Text>
        </View>
        <Text style={s.profileName}>{user?.name || 'SalePe User'}</Text>
        <Text style={s.profilePhone}>+91 {user?.phoneNumber}</Text>
      </View>

      {/* Edit profile */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Edit Profile</Text>

        <Text style={s.label}>Full Name</Text>
        <TextInput style={s.input} placeholder="Your full name" placeholderTextColor={C.textMuted} value={name} onChangeText={setName} />

        <Text style={s.label}>Email Address</Text>
        <TextInput style={s.input} placeholder="your@email.com" placeholderTextColor={C.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" />

        <Text style={s.label}>Mobile Number</Text>
        <TextInput style={[s.input, { opacity: 0.5 }]} value={`+91 ${user?.phoneNumber}`} editable={false} />

        {saved && <Text style={{ color: C.success, fontSize: 13, marginBottom: 12 }}>✓ Profile saved successfully!</Text>}

        <TouchableOpacity style={s.primaryBtn} onPress={handleSave} disabled={loading}>
          <Text style={s.primaryBtnText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </View>

      {/* Menu */}
      <View style={s.card}>
        <TouchableOpacity style={s.menuItem} onPress={() => router.push('/my-ads' as any)}>
          <Text style={s.menuItemText}>📋  My Ads</Text>
          <Text style={{ color: C.accent, fontSize: 16 }}>→</Text>
        </TouchableOpacity>
        <View style={s.menuDivider} />
        <TouchableOpacity style={s.menuItem} onPress={() => router.push('/(tabs)/messages' as any)}>
          <Text style={s.menuItemText}>💬  Messages</Text>
          <Text style={{ color: C.accent, fontSize: 16 }}>→</Text>
        </TouchableOpacity>
        <View style={s.menuDivider} />
        <TouchableOpacity style={s.menuItem} onPress={() => router.push('/(tabs)/saved' as any)}>
          <Text style={s.menuItemText}>❤️  Saved</Text>
          <Text style={{ color: C.accent, fontSize: 16 }}>→</Text>
        </TouchableOpacity>
        <View style={s.menuDivider} />
        <TouchableOpacity
          style={s.menuItem}
          onPress={() => Alert.alert('Coming Soon', 'Analytics feature is coming soon!')}
        >
          <Text style={s.menuItemText}>📊  Analytics</Text>
          <Text style={{ color: C.accent, fontSize: 16 }}>→</Text>
        </TouchableOpacity>
        <View style={s.menuDivider} />
        <TouchableOpacity
          style={s.menuItem}
          onPress={() => Alert.alert('Coming Soon', 'Subscription plans coming soon!')}
        >
          <Text style={s.menuItemText}>⭐  Subscription</Text>
          <Text style={{ color: C.accent, fontSize: 16 }}>→</Text>
        </TouchableOpacity>
        <View style={s.menuDivider} />
        <TouchableOpacity
          style={s.menuItem}
          onPress={() => Alert.alert('Referral', 'Invite link copied!')}
        >
          <Text style={s.menuItemText}>🎁  Invite &amp; Earn</Text>
          <Text style={{ color: C.accent, fontSize: 16 }}>→</Text>
        </TouchableOpacity>
        <View style={s.menuDivider} />
        <TouchableOpacity style={s.menuItem} onPress={handleLogout}>
          <Text style={[s.menuItemText, { color: C.error }]}>🚪  Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  profileHeader: {
    backgroundColor: '#07111e', alignItems: 'center',
    padding: 28, paddingTop: 32, paddingBottom: 28,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(0,200,224,0.15)', borderWidth: 2, borderColor: 'rgba(0,200,224,0.3)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 30, fontWeight: '800', color: '#00c8e0' },
  profileName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  profilePhone: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 },

  card: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, padding: 18, marginHorizontal: 14, marginTop: 14,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  input: {
    backgroundColor: '#f8fafc', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8, padding: 12, color: C.text, fontSize: 14, marginBottom: 14,
  },
  primaryBtn: { backgroundColor: C.accent, borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  primaryBtnText: { color: '#07111e', fontWeight: '700', fontSize: 15 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13 },
  menuItemText: { fontSize: 15, color: C.text, fontWeight: '500' },
  menuDivider: { height: 1, backgroundColor: C.border },
});
