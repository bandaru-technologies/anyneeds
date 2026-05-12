import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { listingApi } from '../../services/api';

const C = {
  bg: '#0a1628', card: '#162040', border: '#1e3060',
  accent: '#00c8e0', text: '#fff', textSub: '#8899bb', textMuted: '#556080',
};

const CATEGORIES = [
  { slug: 'cars', emoji: '🚗', name: 'Cars' },
  { slug: 'bikes', emoji: '🏍️', name: 'Bikes' },
  { slug: 'other-vehicles', emoji: '🚛', name: 'Vehicles' },
  { slug: 'mobiles-electronics', emoji: '📱', name: 'Mobiles' },
  { slug: 'jobs', emoji: '💼', name: 'Jobs' },
  { slug: 'real-estate', emoji: '🏢', name: 'Real Estate' },
  { slug: 'hotel-pg', emoji: '🛏️', name: 'Hotel/PG' },
  { slug: 'furniture-home', emoji: '🛋️', name: 'Furniture' },
  { slug: 'animals-pets', emoji: '🐾', name: 'Pets' },
  { slug: 'fashion-beauty', emoji: '👗', name: 'Fashion' },
  { slug: 'books-education', emoji: '📚', name: 'Books' },
  { slug: 'home-services', emoji: '🔧', name: 'Services' },
  { slug: 'software-it', emoji: '💻', name: 'Software' },
  { slug: 'business', emoji: '📈', name: 'Business' },
  { slug: 'events-promotions', emoji: '🏷️', name: 'Events' },
  { slug: 'others', emoji: '📦', name: 'Others' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiCategories, setApiCategories] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      listingApi.getListings({ size: 10 }),
      listingApi.getCategories(),
    ]).then(([lr, cr]) => {
      setListings(lr.data.content || []);
      setApiCategories(cr.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    if (search.trim()) {
      router.push({ pathname: '/(tabs)/explore', params: { keyword: search.trim() } } as any);
    }
  };

  const handleCategory = (slug: string) => {
    const apiCat = apiCategories.find((c: any) => c.slug === slug);
    if (apiCat) {
      router.push({ pathname: '/(tabs)/explore', params: { categoryId: String(apiCat.id), categoryName: apiCat.name } } as any);
    }
  };

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <Text style={s.logo}>AnyNeeds<Text style={{ color: C.accent }}>.in</Text></Text>
        <Text style={s.logoSub}>Buy & Sell Anything Near You</Text>
      </View>

      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          placeholder="Search cars, mobiles, jobs..."
          placeholderTextColor={C.textMuted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={s.searchBtn} onPress={handleSearch}>
          <Text style={{ fontSize: 18 }}>🔍</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.sectionTitle}>Browse Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat.slug} style={s.catCard} onPress={() => handleCategory(cat.slug)}>
            <Text style={s.catEmoji}>{cat.emoji}</Text>
            <Text style={s.catName}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Fresh Arrivals</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/explore' as any)}>
          <Text style={{ color: C.accent, fontSize: 13, fontWeight: '600' }}>View All →</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={C.accent} style={{ marginVertical: 20 }} />
      ) : listings.length === 0 ? (
        <View style={s.empty}>
          <Text style={{ color: C.textSub, fontSize: 14, marginBottom: 16 }}>No listings yet. Be the first!</Text>
          <TouchableOpacity style={s.ctaBtn} onPress={() => router.push('/post-ad' as any)}>
            <Text style={s.ctaBtnText}>Post Free Ad</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={s.grid}>
          {listings.map((l) => (
            <TouchableOpacity
              key={l.id} style={s.listingCard}
              onPress={() => router.push(`/listing/${l.id}` as any)}
            >
              <View style={s.listingImg}>
                <Text style={{ fontSize: 32, opacity: 0.3 }}>📷</Text>
              </View>
              <View style={{ padding: 10 }}>
                <Text style={s.listingCat}>{l.categoryName}</Text>
                <Text style={s.listingTitle} numberOfLines={2}>{l.title}</Text>
                <Text style={s.listingPrice}>
                  {l.price ? `₹${Number(l.price).toLocaleString('en-IN')}` : 'Price on Request'}
                </Text>
                <Text style={s.listingCity}>{l.city || 'India'}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity style={s.ctaBanner} onPress={() => router.push('/post-ad' as any)}>
        <Text style={s.ctaBannerTitle}>Sell Faster on AnyNeeds</Text>
        <Text style={s.ctaBannerSub}>Post your ad for FREE →</Text>
      </TouchableOpacity>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { padding: 20, paddingTop: 20 },
  logo: { fontSize: 26, fontWeight: '800', color: C.text },
  logoSub: { fontSize: 13, color: C.textSub, marginTop: 2 },
  searchRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 24 },
  searchInput: {
    flex: 1, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, color: C.text, fontSize: 14,
  },
  searchBtn: {
    backgroundColor: C.accent, borderRadius: 10, width: 48,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: C.text, paddingHorizontal: 16, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16 },
  catRow: { paddingLeft: 16, paddingRight: 8, paddingBottom: 8, gap: 10 },
  catCard: {
    alignItems: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 10, width: 70, marginBottom: 20,
  },
  catEmoji: { fontSize: 22, marginBottom: 4 },
  catName: { fontSize: 10, color: C.textSub, textAlign: 'center', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  listingCard: {
    width: '47%', margin: '1.5%', backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border, borderRadius: 12, overflow: 'hidden',
  },
  listingImg: { height: 100, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  listingCat: { fontSize: 10, color: C.accent, fontWeight: '700', textTransform: 'uppercase' },
  listingTitle: { fontSize: 13, fontWeight: '600', color: C.text, marginTop: 2 },
  listingPrice: { fontSize: 14, fontWeight: '800', color: C.accent, marginTop: 4 },
  listingCity: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  empty: { alignItems: 'center', padding: 40 },
  ctaBtn: { backgroundColor: C.accent, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  ctaBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
  ctaBanner: {
    margin: 16, backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 16, padding: 24, alignItems: 'center',
  },
  ctaBannerTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 4 },
  ctaBannerSub: { fontSize: 13, color: C.accent, fontWeight: '600' },
});
