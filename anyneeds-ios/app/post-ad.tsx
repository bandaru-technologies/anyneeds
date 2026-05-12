import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { listingApi } from '../services/api';

const C = {
  bg: '#0a1628', card: '#162040', border: '#1e3060',
  accent: '#00c8e0', text: '#fff', textSub: '#8899bb', textMuted: '#556080',
  error: '#ff5252',
};

export default function PostAdScreen() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please login to post an ad', [
        { text: 'Login', onPress: () => router.replace('/login' as any) },
        { text: 'Cancel', onPress: () => router.back(), style: 'cancel' },
      ]);
    }
    listingApi.getCategories().then((r) => setCategories(r.data)).catch(() => {});
  }, [isLoggedIn]);

  const handleSubmit = async () => {
    setError('');
    if (!title.trim()) { setError('Title is required'); return; }
    if (!selectedCat) { setError('Please select a category'); return; }

    setLoading(true);
    try {
      const { data } = await listingApi.createListing({
        title: title.trim(),
        description: description.trim(),
        price: price ? Number(price) : null,
        categoryId: Number(selectedCat),
        city: city.trim(),
        state: state.trim(),
      });
      Alert.alert('Success!', 'Your ad has been posted successfully', [
        { text: 'View Ad', onPress: () => router.replace(`/listing/${data.id}` as any) },
      ]);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to post ad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {categories.map((c: any) => (
              <TouchableOpacity
                key={c.id}
                style={[s.pill, String(selectedCat) === String(c.id) && s.pillActive]}
                onPress={() => setSelectedCat(String(c.id))}
              >
                <Text style={[s.pillText, String(selectedCat) === String(c.id) && s.pillTextActive]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Ad Details</Text>
          <Text style={s.label}>Title *</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Honda City 2020 - Excellent Condition"
            placeholderTextColor={C.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={200}
          />
          <Text style={s.label}>Description</Text>
          <TextInput
            style={[s.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Describe what you're selling..."
            placeholderTextColor={C.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          <Text style={s.label}>Price (₹)</Text>
          <TextInput
            style={s.input}
            placeholder="Leave blank for Price on Request"
            placeholderTextColor={C.textMuted}
            value={price}
            onChangeText={(t) => setPrice(t.replace(/\D/g, ''))}
            keyboardType="numeric"
          />
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Location</Text>
          <Text style={s.label}>City</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Hyderabad"
            placeholderTextColor={C.textMuted}
            value={city}
            onChangeText={setCity}
          />
          <Text style={s.label}>State</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Telangana"
            placeholderTextColor={C.textMuted}
            value={state}
            onChangeText={setState}
          />
        </View>

        {error ? <Text style={s.error}>{error}</Text> : null}

        <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={loading}>
          <Text style={s.submitBtnText}>{loading ? 'Posting...' : 'Post Ad for FREE'}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  section: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 16, padding: 16, margin: 12, marginBottom: 0,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: C.textSub, marginBottom: 6 },
  input: {
    backgroundColor: '#0f1e3a', borderWidth: 1.5, borderColor: C.border,
    borderRadius: 8, padding: 12, color: C.text, fontSize: 14, marginBottom: 14,
  },
  pill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1.5, borderColor: C.border, backgroundColor: '#0f1e3a',
  },
  pillActive: { borderColor: C.accent, backgroundColor: 'rgba(0,200,224,0.1)' },
  pillText: { fontSize: 12, color: C.textSub, fontWeight: '600' },
  pillTextActive: { color: C.accent },
  error: {
    color: C.error, fontSize: 13, backgroundColor: 'rgba(255,82,82,0.1)',
    padding: 12, borderRadius: 8, margin: 12, borderWidth: 1, borderColor: 'rgba(255,82,82,0.2)',
  },
  submitBtn: {
    backgroundColor: C.accent, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', margin: 12, marginTop: 16,
  },
  submitBtnText: { color: '#000', fontWeight: '700', fontSize: 16 },
});
