import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { wishlistApi } from '../../services/api';

const C = {
  bg: '#f5f7fa', card: '#ffffff', border: 'rgba(0,0,0,0.09)',
  accent: '#00c8e0', accentDark: '#07111e',
  text: '#1e293b', textSub: '#475569', textMuted: '#94a3b8',
  error: '#ef4444', success: '#22c55e', warning: '#f97316',
};

function fmtPrice(price: any) {
  if (!price) return 'On Request';
  return `₹${Number(price).toLocaleString('en-IN')}`;
}

function fmtLocation(l: any) {
  if (l.location && l.city) return `${l.location}, ${l.city}`;
  return l.city || l.location || 'India';
}

export default function SavedScreen() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSaved = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const { data } = await wishlistApi.getSaved();
      // API may return an array of wishlist items with a `listing` field, or direct listings array
      const items = Array.isArray(data)
        ? data.map((item: any) => item.listing || item)
        : (data.content || []);
      setListings(items);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSaved();
  };

  if (!isLoggedIn) {
    return (
      <View style={s.centered}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>❤️</Text>
        <Text style={{ color: C.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Save Your Favourites</Text>
        <Text style={{ color: C.textSub, fontSize: 14, marginBottom: 28, textAlign: 'center', lineHeight: 20 }}>
          Login to see your saved listings
        </Text>
        <TouchableOpacity style={s.primaryBtn} onPress={() => router.push('/login' as any)}>
          <Text style={s.primaryBtnText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator color={C.accent} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      style={s.container}
      data={listings}
      keyExtractor={(l) => String(l.id)}
      numColumns={2}
      columnWrapperStyle={s.columnWrapper}
      contentContainerStyle={{ paddingHorizontal: 10, paddingTop: 12, paddingBottom: 80 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.accent} />
      }
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
          <Text style={{ fontSize: 40 }}>❤️</Text>
          <Text style={{ color: C.textSub, fontSize: 14, marginTop: 12, marginBottom: 20 }}>
            No saved listings yet
          </Text>
          <TouchableOpacity style={s.primaryBtn} onPress={() => router.push('/(tabs)/explore' as any)}>
            <Text style={s.primaryBtnText}>Browse Listings</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  centered: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', padding: 32 },
  primaryBtn: { backgroundColor: C.accent, borderRadius: 10, paddingVertical: 13, paddingHorizontal: 28, alignItems: 'center' },
  primaryBtnText: { color: '#07111e', fontWeight: '700', fontSize: 15 },
  columnWrapper: { gap: 10 },
  listingCard: {
    flex: 1, maxWidth: '50%', backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border, borderRadius: 12, overflow: 'hidden',
  },
  listingImg: { width: '100%', height: 96 },
  listingImgPlaceholder: { backgroundColor: '#f0f4f8', alignItems: 'center', justifyContent: 'center' },
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
  empty: { alignItems: 'center', paddingTop: 80 },
});
