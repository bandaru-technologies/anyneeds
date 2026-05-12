import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';

const C = {
  bg: '#0a1628', card: '#162040', border: '#1e3060',
  accent: '#00c8e0', text: '#fff', textSub: '#8899bb', textMuted: '#556080',
  error: '#ff5252', success: '#00e676',
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
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>👤</Text>
        <Text style={{ color: C.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
          Login to AnyNeeds
        </Text>
        <Text style={{ color: C.textSub, fontSize: 14, marginBottom: 28, textAlign: 'center' }}>
          Login to post ads, track your listings, and more
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
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.profileHeader}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>
            {(user?.name || user?.phoneNumber || 'U')[0].toUpperCase()}
          </Text>
        </View>
        <Text style={s.profileName}>{user?.name || 'AnyNeeds User'}</Text>
        <Text style={s.profilePhone}>+91 {user?.phoneNumber}</Text>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Edit Profile</Text>

        <Text style={s.label}>Full Name</Text>
        <TextInput
          style={s.input}
          placeholder="Your full name"
          placeholderTextColor={C.textMuted}
          value={name}
          onChangeText={setName}
        />

        <Text style={s.label}>Email Address</Text>
        <TextInput
          style={s.input}
          placeholder="your@email.com"
          placeholderTextColor={C.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Text style={s.label}>Mobile Number</Text>
        <TextInput
          style={[s.input, { opacity: 0.5 }]}
          value={`+91 ${user?.phoneNumber}`}
          editable={false}
        />

        {saved && (
          <Text style={{ color: C.success, fontSize: 13, marginBottom: 12 }}>
            Profile saved successfully!
          </Text>
        )}

        <TouchableOpacity style={s.primaryBtn} onPress={handleSave} disabled={loading}>
          <Text style={s.primaryBtnText}>{loading ? 'Saving...' : 'Save Profile'}</Text>
        </TouchableOpacity>
      </View>

      <View style={s.card}>
        <TouchableOpacity style={s.menuItem} onPress={() => router.push('/my-ads' as any)}>
          <Text style={s.menuItemText}>📋  My Ads</Text>
          <Text style={{ color: C.accent }}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.menuItem, { borderTopWidth: 1, borderTopColor: C.border }]} onPress={handleLogout}>
          <Text style={[s.menuItemText, { color: C.error }]}>🚪  Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  profileHeader: { alignItems: 'center', padding: 28, paddingBottom: 20 },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: C.accent,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#000' },
  profileName: { fontSize: 22, fontWeight: '700', color: C.text },
  profilePhone: { fontSize: 14, color: C.textSub, marginTop: 4 },
  card: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 16, padding: 20, marginHorizontal: 16, marginBottom: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: C.textSub, marginBottom: 6 },
  input: {
    backgroundColor: '#0f1e3a', borderWidth: 1.5, borderColor: C.border,
    borderRadius: 8, padding: 12, color: C.text, fontSize: 14, marginBottom: 14,
  },
  primaryBtn: {
    backgroundColor: C.accent, borderRadius: 10, paddingVertical: 14, alignItems: 'center',
  },
  primaryBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  menuItemText: { fontSize: 15, color: C.text, fontWeight: '500' },
});
