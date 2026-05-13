import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, ScrollView, Switch, Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { listingApi } from '../../services/api';

const C = {
  bg: '#f5f7fa', card: '#ffffff', border: 'rgba(0,0,0,0.09)',
  accent: '#00c8e0', accentDark: '#07111e',
  text: '#1e293b', textSub: '#475569', textMuted: '#94a3b8',
  error: '#ef4444', success: '#22c55e', warning: '#f97316',
};

const CONDITIONS = [
  { label: 'ANY', value: '' },
  { label: 'NEW', value: 'NEW' },
  { label: 'LIKE NEW', value: 'LIKE_NEW' },
  { label: 'GOOD', value: 'GOOD' },
  { label: 'FAIR', value: 'FAIR' },
];

const POSTED_IN = [
  { label: 'Any Time', value: '' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
];

function fmtPrice(price: any) {
  if (!price) return 'On Request';
  return `₹${Number(price).toLocaleString('en-IN')}`;
}

function fmtLocation(l: any) {
  if (l.location && l.city) return `${l.location}, ${l.city}`;
  return l.city || l.location || 'India';
}

export default function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ keyword?: string; categoryId?: string }>();

  const [listings, setListings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(params.keyword || '');
  const [area, setArea] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>(params.categoryId || '');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  // Extra filters
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [negotiableOnly, setNegotiableOnly] = useState(false);
  const [postedIn, setPostedIn] = useState('');

  useEffect(() => {
    listingApi.getCategories().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const fetchListings = useCallback(async (pg = 0, append = false) => {
    setLoading(true);
    try {
      const p: any = { page: pg, size: 20 };
      if (selectedCat) p.categoryId = selectedCat;
      if (keyword) p.keyword = keyword;
      if (area) p.area = area;
      if (minPrice) p.minPrice = Number(minPrice);
      if (maxPrice) p.maxPrice = Number(maxPrice);
      if (condition) p.condition = condition;
      if (negotiableOnly) p.negotiable = true;
      if (postedIn) p.postedIn = postedIn;
      const { data } = await listingApi.getListings(p);
      const items = data.content || [];
      setListings((prev) => (append ? [...prev, ...items] : items));
      setTotal(data.totalElements || 0);
      setHasMore(!data.last);
      setPage(pg);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCat, keyword, area, minPrice, maxPrice, condition, negotiableOnly, postedIn]);

  useEffect(() => {
    if (params.categoryId) setSelectedCat(params.categoryId);
    if (params.keyword) setKeyword(params.keyword);
  }, [params.categoryId, params.keyword]);

  useEffect(() => { fetchListings(0); }, [fetchListings]);

  return (
    <View style={s.container}>
      {/* Search */}
      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          placeholder="Search listings..."
          placeholderTextColor={C.textMuted}
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={() => fetchListings(0)}
          returnKeyType="search"
        />
        <TouchableOpacity style={s.searchBtn} onPress={() => fetchListings(0)}>
          <Text style={{ fontSize: 18 }}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Area filter */}
      <View style={s.areaRow}>
        <TextInput
          style={s.areaInput}
          placeholder="📍 Area / Locality (e.g. Whitefield)"
          placeholderTextColor={C.textMuted}
          value={area}
          onChangeText={setArea}
          onSubmitEditing={() => fetchListings(0)}
          returnKeyType="search"
        />
      </View>

      {/* Price range row */}
      <View style={s.priceRow}>
        <TextInput
          style={s.priceInput}
          placeholder="Min Price ₹"
          placeholderTextColor={C.textMuted}
          value={minPrice}
          onChangeText={(t) => setMinPrice(t.replace(/\D/g, ''))}
          keyboardType="numeric"
          onSubmitEditing={() => fetchListings(0)}
          returnKeyType="done"
        />
        <Text style={s.priceSep}>–</Text>
        <TextInput
          style={s.priceInput}
          placeholder="Max Price ₹"
          placeholderTextColor={C.textMuted}
          value={maxPrice}
          onChangeText={(t) => setMaxPrice(t.replace(/\D/g, ''))}
          keyboardType="numeric"
          onSubmitEditing={() => fetchListings(0)}
          returnKeyType="done"
        />
      </View>

      {/* Condition pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={s.pillRow}>
        {CONDITIONS.map((c) => (
          <TouchableOpacity
            key={c.value}
            style={[s.filterChip, condition === c.value && s.filterChipActive]}
            onPress={() => setCondition(c.value)}
          >
            <Text style={[s.filterChipText, condition === c.value && s.filterChipTextActive]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Negotiable toggle */}
      <View style={s.toggleRow}>
        <Text style={s.toggleLabel}>Negotiable Only</Text>
        <Switch
          value={negotiableOnly}
          onValueChange={setNegotiableOnly}
          trackColor={{ false: C.border, true: 'rgba(0,200,224,0.35)' }}
          thumbColor={negotiableOnly ? C.accent : '#ccc'}
        />
      </View>

      {/* Posted-in pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={s.pillRow}>
        {POSTED_IN.map((p) => (
          <TouchableOpacity
            key={p.value}
            style={[s.filterChip, postedIn === p.value && s.filterChipActive]}
            onPress={() => setPostedIn(p.value)}
          >
            <Text style={[s.filterChipText, postedIn === p.value && s.filterChipTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Category chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={s.catRow}>
        <TouchableOpacity
          style={[s.catChip, !selectedCat && s.catChipActive]}
          onPress={() => setSelectedCat('')}
        >
          <Text style={[s.catChipText, !selectedCat && s.catChipTextActive]}>All</Text>
        </TouchableOpacity>
        {categories.map((c: any) => (
          <TouchableOpacity
            key={c.id}
            style={[s.catChip, String(selectedCat) === String(c.id) && s.catChipActive]}
            onPress={() => setSelectedCat(String(c.id))}
          >
            <Text style={[s.catChipText, String(selectedCat) === String(c.id) && s.catChipTextActive]}>
              {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {!loading && (
        <Text style={s.resultCount}>{total} listings found</Text>
      )}

      {loading && listings.length === 0 ? (
        <ActivityIndicator color={C.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(l) => String(l.id)}
          numColumns={2}
          columnWrapperStyle={s.columnWrapper}
          contentContainerStyle={{ paddingBottom: 80, paddingTop: 4 }}
          renderItem={({ item: l }) => (
            <TouchableOpacity
              style={s.listingCard}
              onPress={() => router.push(`/listing/${l.id}` as any)}
            >
              {l.imageUrls && l.imageUrls.length > 0 ? (
                <Image
                  source={{ uri: l.imageUrls[0] }}
                  style={s.listingImg}
                  resizeMode="cover"
                />
              ) : (
                <View style={[s.listingImg, s.listingImgPlaceholder]}>
                  <Text style={{ fontSize: 26, opacity: 0.2 }}>📷</Text>
                </View>
              )}
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
                {l.negotiable && (
                  <View style={s.negoBadge}>
                    <Text style={s.negoBadgeText}>Nego</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={{ fontSize: 36 }}>🔍</Text>
              <Text style={{ color: C.textSub, fontSize: 14, marginTop: 12 }}>No listings found</Text>
            </View>
          }
          onEndReached={hasMore ? () => fetchListings(page + 1, true) : undefined}
          onEndReachedThreshold={0.4}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  searchRow: { flexDirection: 'row', gap: 8, padding: 12, paddingTop: 14, paddingBottom: 6 },
  searchInput: {
    flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, color: C.text, fontSize: 14,
  },
  searchBtn: {
    backgroundColor: C.accent, borderRadius: 10, width: 46, alignItems: 'center', justifyContent: 'center',
  },
  areaRow: { paddingHorizontal: 12, paddingBottom: 6 },
  areaInput: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, color: C.text, fontSize: 13,
  },
  priceRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 6, gap: 8,
  },
  priceInput: {
    flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, color: C.text, fontSize: 13,
  },
  priceSep: { color: C.textMuted, fontSize: 14, fontWeight: '600' },
  pillRow: { paddingHorizontal: 12, gap: 8, paddingBottom: 6, alignItems: 'center' },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.card,
    alignSelf: 'flex-start', height: 32, justifyContent: 'center',
  },
  filterChipActive: { borderColor: C.accent, backgroundColor: 'rgba(0,200,224,0.08)' },
  filterChipText: { fontSize: 12, color: C.textSub, fontWeight: '600' },
  filterChipTextActive: { color: C.accent },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 6,
  },
  toggleLabel: { fontSize: 13, color: C.textSub, fontWeight: '600' },
  catRow: { paddingHorizontal: 12, gap: 8, paddingBottom: 10, alignItems: 'center' },
  catChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.card,
    alignSelf: 'flex-start', height: 34, justifyContent: 'center',
  },
  catChipActive: { borderColor: C.accent, backgroundColor: 'rgba(0,200,224,0.08)' },
  catChipText: { fontSize: 12, color: C.textSub, fontWeight: '600' },
  catChipTextActive: { color: C.accent },
  resultCount: { fontSize: 12, color: C.textMuted, paddingHorizontal: 14, marginBottom: 6 },
  columnWrapper: { paddingHorizontal: 10, gap: 10 },
  listingCard: {
    flex: 1, maxWidth: '50%', backgroundColor: C.card,
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
  negoBadgeText: { fontSize: 9, color: '#22c55e', fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60 },
});
