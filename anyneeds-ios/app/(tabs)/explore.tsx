import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { listingApi } from '../../services/api';

const C = {
  bg: '#0a1628', card: '#162040', border: '#1e3060',
  accent: '#00c8e0', text: '#fff', textSub: '#8899bb', textMuted: '#556080',
};

export default function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ keyword?: string; categoryId?: string; categoryName?: string }>();

  const [listings, setListings] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(params.keyword || '');
  const [selectedCat, setSelectedCat] = useState<string>(params.categoryId || '');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    listingApi.getCategories().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const fetchListings = useCallback(async (pg = 0, append = false) => {
    setLoading(true);
    try {
      const p: any = { page: pg, size: 20 };
      if (selectedCat) p.categoryId = selectedCat;
      if (keyword) p.keyword = keyword;
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
  }, [selectedCat, keyword]);

  useEffect(() => {
    if (params.categoryId) setSelectedCat(params.categoryId);
    if (params.keyword) setKeyword(params.keyword);
  }, [params.categoryId, params.keyword]);

  useEffect(() => { fetchListings(0); }, [fetchListings]);

  const handleSearch = () => fetchListings(0);

  return (
    <View style={s.container}>
      {/* Search bar */}
      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          placeholder="Search listings..."
          placeholderTextColor={C.textMuted}
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={s.searchBtn} onPress={handleSearch}>
          <Text style={{ fontSize: 18 }}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catRow}>
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
          columnWrapperStyle={{ paddingHorizontal: 12 }}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item: l }) => (
            <TouchableOpacity
              style={s.listingCard}
              onPress={() => router.push(`/listing/${l.id}` as any)}
            >
              <View style={s.listingImg}>
                <Text style={{ fontSize: 28, opacity: 0.25 }}>📷</Text>
              </View>
              <View style={{ padding: 10 }}>
                <Text style={s.listingCat}>{l.categoryName}</Text>
                <Text style={s.listingTitle} numberOfLines={2}>{l.title}</Text>
                <Text style={s.listingPrice}>
                  {l.price ? `₹${Number(l.price).toLocaleString('en-IN')}` : 'On Request'}
                </Text>
                <Text style={s.listingCity}>{l.city || 'India'}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={{ fontSize: 40 }}>🔍</Text>
              <Text style={{ color: C.textSub, fontSize: 14, marginTop: 12 }}>
                No listings found
              </Text>
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
  searchRow: { flexDirection: 'row', gap: 8, padding: 12, paddingTop: 16 },
  searchInput: {
    flex: 1, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, color: C.text, fontSize: 14,
  },
  searchBtn: {
    backgroundColor: C.accent, borderRadius: 10, width: 46, alignItems: 'center', justifyContent: 'center',
  },
  catRow: { paddingHorizontal: 12, gap: 8, paddingBottom: 10 },
  catChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1.5, borderColor: C.border, backgroundColor: C.card,
  },
  catChipActive: { borderColor: C.accent, backgroundColor: 'rgba(0,200,224,0.12)' },
  catChipText: { fontSize: 12, color: C.textSub, fontWeight: '600' },
  catChipTextActive: { color: C.accent },
  resultCount: { fontSize: 12, color: C.textMuted, paddingHorizontal: 16, marginBottom: 8 },
  listingCard: {
    flex: 1, margin: '1.5%', backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border, borderRadius: 12, overflow: 'hidden',
  },
  listingImg: { height: 100, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  listingCat: { fontSize: 9, color: C.accent, fontWeight: '700', textTransform: 'uppercase' },
  listingTitle: { fontSize: 12, fontWeight: '600', color: C.text, marginTop: 2 },
  listingPrice: { fontSize: 13, fontWeight: '800', color: C.accent, marginTop: 3 },
  listingCity: { fontSize: 10, color: C.textMuted, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 60 },
});
