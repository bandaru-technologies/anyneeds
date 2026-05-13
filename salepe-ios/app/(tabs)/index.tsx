import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { listingApi } from '../../services/api';

const C = {
  bg: '#f5f7fa', card: '#ffffff', border: 'rgba(0,0,0,0.09)',
  accent: '#00c8e0', accentDark: '#07111e',
  text: '#1e293b', textSub: '#475569', textMuted: '#94a3b8',
  error: '#ef4444', success: '#22c55e', warning: '#f97316',
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

function fmtPrice(price: any) {
  if (!price) return 'On Request';
  return `₹${Number(price).toLocaleString('en-IN')}`;
}

function fmtLocation(l: any) {
  if (l.location && l.city) return `${l.location}, ${l.city}`;
  return l.city || l.location || 'India';
}

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiCategories, setApiCategories] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      listingApi.getListings({ size: 20 }),
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
      {/* Hero */}
      <View style={s.hero}>
        <Text style={s.heroTitle}>
          Everything On Sale,
        </Text>
        <Text style={s.heroTitleAccent}>Near You</Text>
        <Text style={s.heroSub}>
          Discover nearby deals, connect with trusted buyers and sellers across India.
        </Text>

        <View style={s.searchRow}>
          <TextInput
            style={s.searchInput}
            placeholder="Search cars, mobiles, jobs..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={s.searchBtn} onPress={handleSearch}>
            <Text style={{ fontSize: 18 }}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Browse Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.slug} style={s.catCard} onPress={() => handleCategory(cat.slug)}>
              <Text style={s.catEmoji}>{cat.emoji}</Text>
              <Text style={s.catName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Fresh listings */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Fresh Listings</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/explore' as any)}>
            <Text style={s.viewAll}>View All →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={C.accent} style={{ marginVertical: 20 }} />
        ) : listings.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ color: C.textMuted, fontSize: 14, marginBottom: 16 }}>No listings yet. Be the first!</Text>
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
                {/* Card image */}
                {l.imageUrls && l.imageUrls.length > 0 ? (
                  <Image
                    source={{ uri: l.imageUrls[0] }}
                    style={s.listingImg}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[s.listingImg, s.listingImgPlaceholder]}>
                    <Text style={{ fontSize: 28, opacity: 0.2 }}>📷</Text>
                  </View>
                )}

                {/* Sponsored badge */}
                {l.boosted && (
                  <View style={s.sponsoredBadge}>
                    <Text style={s.sponsoredBadgeText}>⚡ Sponsored</Text>
                  </View>
                )}

                <View style={s.listingBody}>
                  <Text style={s.listingCat}>{l.categoryName}</Text>
                  <View style={s.titlePriceRow}>
                    <Text style={s.listingTitle} numberOfLines={2}>{l.title}</Text>
                    <Text style={s.listingPrice}>{fmtPrice(l.price)}</Text>
                  </View>
                  <Text style={s.listingCity} numberOfLines={1}>{fmtLocation(l)}</Text>

                  {/* Negotiable badge */}
                  {l.negotiable && (
                    <View style={s.negoBadge}>
                      <Text style={s.negoBadgeText}>Nego</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* CTA */}
      <TouchableOpacity style={s.ctaBanner} onPress={() => router.push('/post-ad' as any)}>
        <Text style={s.ctaBannerTitle}>Sell Faster on SalePe</Text>
        <Text style={s.ctaBannerSub}>Post your ad for FREE →</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  hero: {
    backgroundColor: '#07111e',
    padding: 20,
    paddingTop: 24,
    paddingBottom: 28,
  },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#fff', lineHeight: 32 },
  heroTitleAccent: { fontSize: 26, fontWeight: '800', color: C.accent, marginBottom: 8, lineHeight: 32 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 16, lineHeight: 18 },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchInput: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, color: '#fff', fontSize: 14,
  },
  searchBtn: {
    backgroundColor: C.accent, borderRadius: 10, width: 48,
    alignItems: 'center', justifyContent: 'center',
  },

  section: { paddingTop: 20, paddingHorizontal: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 12 },
  viewAll: { color: C.accent, fontSize: 13, fontWeight: '600' },

  catRow: { gap: 10, paddingBottom: 4 },
  catCard: {
    alignItems: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 10, width: 68,
  },
  catEmoji: { fontSize: 22, marginBottom: 4 },
  catName: { fontSize: 10, color: C.textSub, textAlign: 'center', fontWeight: '600' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  listingCard: {
    width: '48%', backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border, borderRadius: 12, overflow: 'hidden',
  },
  listingImg: { width: '100%', height: 96 },
  listingImgPlaceholder: { backgroundColor: '#f0f4f8', alignItems: 'center', justifyContent: 'center' },
  sponsoredBadge: {
    position: 'absolute', top: 6, left: 6,
    backgroundColor: 'rgba(249,115,22,0.9)', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  sponsoredBadgeText: { fontSize: 9, color: '#fff', fontWeight: '700' },
  listingBody: { padding: 10 },
  listingCat: { fontSize: 9, color: C.accent, fontWeight: '700', textTransform: 'uppercase' },
  titlePriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4, marginTop: 2 },
  listingTitle: { fontSize: 12, fontWeight: '600', color: C.text, flex: 1 },
  listingPrice: { fontSize: 12, fontWeight: '800', color: C.text, flexShrink: 0 },
  listingCity: { fontSize: 10, color: C.textMuted, marginTop: 4 },
  negoBadge: {
    alignSelf: 'flex-start', marginTop: 5,
    backgroundColor: 'rgba(34,197,94,0.1)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)',
    borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2,
  },
  negoBadgeText: { fontSize: 9, color: C.success, fontWeight: '700' },

  empty: { alignItems: 'center', padding: 32 },
  ctaBtn: { backgroundColor: C.accent, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  ctaBtnText: { color: '#07111e', fontWeight: '700', fontSize: 14 },

  ctaBanner: {
    margin: 14, marginTop: 20, backgroundColor: '#07111e',
    borderRadius: 14, padding: 22, alignItems: 'center',
  },
  ctaBannerTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 4 },
  ctaBannerSub: { fontSize: 13, color: C.accent, fontWeight: '600' },
});
