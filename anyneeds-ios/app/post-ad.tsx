import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { listingApi } from '../services/api';

const C = {
  bg: '#f5f7fa', card: '#ffffff', border: 'rgba(0,0,0,0.1)',
  accent: '#00c8e0', text: '#1e293b', textSub: '#475569', textMuted: '#94a3b8',
  error: '#ef4444',
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
  const [area, setArea] = useState('');
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
    if (!selectedCat) { setError('Please select a category'); return; }
    if (!title.trim()) { setError('Title is required'); return; }
    if (!city.trim()) { setError('City is required'); return; }

    setLoading(true);
    try {
      const { data } = await listingApi.createListing({
        title: title.trim(),
        description: description.trim(),
        price: price ? Number(price) : null,
        categoryId: Number(selectedCat),
        city: city.trim(),
        state: state.trim(),
        location: area.trim(),
      });
      Alert.alert('Ad Posted!', 'Your ad is now live', [
        { text: 'View Ad', onPress: () => router.replace(`/listing/${data.id}` as any) },
        { text: 'Post Another', onPress: () => { setTitle(''); setDescription(''); setPrice(''); setArea(''); } },
      ]);
    } catch (e: any) {
      const d = e.response?.data;
      if (d?.errors) setError(Object.values(d.errors).join(', '));
      else setError(d?.error || 'Failed to post ad. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

        {/* Category */}
        <View style={s.section}>
          <Text style={s.sectionNum}>1</Text>
          <Text style={s.sectionTitle}>Select Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
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

        {/* Ad Details */}
        <View style={s.section}>
          <Text style={s.sectionNum}>2</Text>
          <Text style={s.sectionTitle}>Ad Details</Text>
          <Text style={s.label}>Title *</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Honda City 2020 – Excellent Condition"
            placeholderTextColor={C.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={200}
          />
          <Text style={s.label}>Description</Text>
          <TextInput
            style={[s.input, { height: 96, textAlignVertical: 'top', paddingTop: 12 }]}
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

        {/* Location */}
        <View style={s.section}>
          <Text style={s.sectionNum}>3</Text>
          <Text style={s.sectionTitle}>Location</Text>
          <View style={s.locRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>City *</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. Bengaluru"
                placeholderTextColor={C.textMuted}
                value={city}
                onChangeText={setCity}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>State</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. Karnataka"
                placeholderTextColor={C.textMuted}
                value={state}
                onChangeText={setState}
              />
            </View>
          </View>
          <Text style={s.label}>Locality / Area</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Whitefield, Koramangala"
            placeholderTextColor={C.textMuted}
            value={area}
            onChangeText={setArea}
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
    borderRadius: 14, padding: 16, margin: 12, marginBottom: 0,
  },
  sectionNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(0,200,224,0.1)', color: C.accent,
    fontSize: 12, fontWeight: '800', textAlign: 'center', lineHeight: 24,
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 14 },
  label: { fontSize: 11, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 },
  input: {
    backgroundColor: '#f8fafc', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8, padding: 12, color: C.text, fontSize: 14, marginBottom: 14,
  },
  locRow: { flexDirection: 'row', gap: 10 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', backgroundColor: '#f8fafc',
  },
  pillActive: { borderColor: C.accent, backgroundColor: 'rgba(0,200,224,0.08)' },
  pillText: { fontSize: 12, color: C.textSub, fontWeight: '600' },
  pillTextActive: { color: C.accent },
  error: {
    color: C.error, fontSize: 13, backgroundColor: 'rgba(239,68,68,0.08)',
    padding: 12, borderRadius: 8, margin: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)',
  },
  submitBtn: {
    backgroundColor: C.accent, borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', margin: 12, marginTop: 16,
  },
  submitBtnText: { color: '#07111e', fontWeight: '700', fontSize: 16 },
});
