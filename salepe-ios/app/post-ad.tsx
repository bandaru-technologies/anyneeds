import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { listingApi } from '../services/api';

const C = {
  bg: '#f5f7fa', card: '#ffffff', border: 'rgba(0,0,0,0.1)',
  accent: '#00c8e0', accentDark: '#07111e',
  text: '#1e293b', textSub: '#475569', textMuted: '#94a3b8',
  error: '#ef4444', success: '#22c55e',
};

const CATEGORY_ICONS: Record<string, string> = {
  'cars': '🚗',
  'bikes': '🏍️',
  'other-vehicles': '🚛',
  'mobiles-electronics': '📱',
  'jobs': '💼',
  'real-estate': '🏢',
  'hotel-pg': '🛏️',
  'furniture-home': '🛋️',
  'carpool-travel': '🗺️',
  'animals-pets': '🐾',
  'fashion-beauty': '👗',
  'books-education': '📚',
  'events-promotions': '🏷️',
  'home-services': '🔧',
  'software-it': '💻',
  'business': '📈',
  'others': '📦',
};

const CONDITIONS = [
  { label: 'Brand New', value: 'NEW' },
  { label: 'Like New', value: 'LIKE_NEW' },
  { label: 'Good', value: 'GOOD' },
  { label: 'Fair', value: 'FAIR' },
];

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
  const [condition, setCondition] = useState('');
  const [negotiable, setNegotiable] = useState(false);
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
        condition: condition || null,
        negotiable,
      });
      Alert.alert('Ad Posted!', 'Your ad is now live', [
        { text: 'View Ad', onPress: () => router.replace(`/listing/${data.id}` as any) },
        {
          text: 'Post Another',
          onPress: () => {
            setTitle(''); setDescription(''); setPrice(''); setArea('');
            setCondition(''); setNegotiable(false);
          },
        },
      ]);
    } catch (e: any) {
      const d = e.response?.data;
      if (d?.errors) setError(Object.values(d.errors).join(', '));
      else setError(d?.error || 'Failed to post ad. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Build a 2-column grid from categories, enriched with icons from slug
  const categoryRows: any[][] = [];
  for (let i = 0; i < categories.length; i += 2) {
    categoryRows.push(categories.slice(i, i + 2));
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

        {/* Category grid */}
        <View style={s.section}>
          <Text style={s.sectionNum}>1</Text>
          <Text style={s.sectionTitle}>Select Category *</Text>
          {categoryRows.map((row, ri) => (
            <View key={ri} style={s.catGridRow}>
              {row.map((c: any) => {
                const icon = CATEGORY_ICONS[c.slug] || '📦';
                const isActive = String(selectedCat) === String(c.id);
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[s.catTile, isActive && s.catTileActive]}
                    onPress={() => setSelectedCat(String(c.id))}
                  >
                    <View style={[s.catTileIconBox, isActive && s.catTileIconBoxActive]}>
                      <Text style={s.catTileIcon}>{icon}</Text>
                    </View>
                    <Text style={[s.catTileName, isActive && s.catTileNameActive]} numberOfLines={2}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {/* If odd number of categories, fill with empty slot */}
              {row.length === 1 && <View style={s.catTileEmpty} />}
            </View>
          ))}
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

          {/* Condition */}
          <Text style={s.label}>Condition</Text>
          <View style={s.pillsRow}>
            {CONDITIONS.map((cond) => (
              <TouchableOpacity
                key={cond.value}
                style={[s.pill, condition === cond.value && s.pillActive]}
                onPress={() => setCondition(cond.value)}
              >
                <Text style={[s.pillText, condition === cond.value && s.pillTextActive]}>
                  {cond.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Negotiable toggle */}
          <View style={s.toggleRow}>
            <View>
              <Text style={s.toggleLabel}>Price Negotiable</Text>
              <Text style={s.toggleSub}>Allow buyers to negotiate the price</Text>
            </View>
            <Switch
              value={negotiable}
              onValueChange={setNegotiable}
              trackColor={{ false: 'rgba(0,0,0,0.12)', true: 'rgba(0,200,224,0.35)' }}
              thumbColor={negotiable ? C.accent : '#ccc'}
            />
          </View>
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

  // Category grid
  catGridRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  catTile: {
    flex: 1, alignItems: 'center', padding: 12, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.border, backgroundColor: '#f8fafc',
  },
  catTileActive: {
    borderColor: C.accent, backgroundColor: 'rgba(0,200,224,0.07)',
  },
  catTileIconBox: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: '#eef1f5', alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  catTileIconBoxActive: { backgroundColor: 'rgba(0,200,224,0.15)' },
  catTileIcon: { fontSize: 24 },
  catTileName: { fontSize: 12, fontWeight: '600', color: C.textSub, textAlign: 'center' },
  catTileNameActive: { color: C.accent },
  catTileEmpty: { flex: 1 },

  // Condition pills
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', backgroundColor: '#f8fafc',
  },
  pillActive: { borderColor: C.accent, backgroundColor: 'rgba(0,200,224,0.08)' },
  pillText: { fontSize: 12, color: C.textSub, fontWeight: '600' },
  pillTextActive: { color: C.accent },

  // Negotiable toggle
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8, marginBottom: 4,
  },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: C.text },
  toggleSub: { fontSize: 11, color: C.textMuted, marginTop: 2 },

  locRow: { flexDirection: 'row', gap: 10 },
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
