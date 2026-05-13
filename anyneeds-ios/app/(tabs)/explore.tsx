import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { listingApi } from '../../services/api';

const C = {
  bg: '#f5f7fa', card: '#ffffff', border: 'rgba(0,0,0,0.09)',
  accent: '#00c8e0', text: '#1e293b', textSub: '#475569', textMuted: '#94a3b8',
};

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
  }, [selectedCat, keyword, area]);

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
              <View style={s.listingImg}>
                <Text style={{ fontSize: 26, opacity: 0.2 }}>📷</Text>
              </View>
              <View style={s.listingBody}>
                <Text style={s.listingCat}>{l.categoryName}</Text>
                <View style={s.titlePriceRow}>
                  <Text style={s.listingTitle} numberOfLines={2}>{l.title}</Text>
                  <Text style={s.listingPrice}>{fmtPrice(l.price)}</Text>
                </View>
                <Text style={s.listingCity} numberOfLines={1}>{fmtLocation(l)}</Text>
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
  areaRow: { paddingHorizontal: 12, paddingBottom: 8 },
  areaInput: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, color: C.text, fontSize: 13,
  },
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
  listingImg: { height: 96, backgroundColor: '#f0f4f8', alignItems: 'center', justifyContent: 'center' },
  listingBody: { padding: 10 },
  listingCat: { fontSize: 9, color: C.accent, fontWeight: '700', textTransform: 'uppercase' },
  titlePriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4, marginTop: 2 },
  listingTitle: { fontSize: 12, fontWeight: '600', color: C.text, flex: 1 },
  listingPrice: { fontSize: 12, fontWeight: '800', color: C.text, flexShrink: 0 },
  listingCity: { fontSize: 10, color: C.textMuted, marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 60 },
});
