import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { listingApi } from '../../services/api';

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

export default function MyAdsScreen() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyAds = () => {
    setLoading(true);
    listingApi.getMyListings()
      .then((r) => setListings(r.data.content || r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isLoggedIn) { router.replace('/login' as any); return; }
    fetchMyAds();
  }, [isLoggedIn]);

  const handleMarkSold = (id: number) => {
    Alert.alert('Mark as Sold', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Mark Sold', onPress: async () => { await listingApi.markAsSold(id); fetchMyAds(); } },
    ]);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Listing', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await listingApi.deleteListing(id); fetchMyAds(); } },
    ]);
  };

  if (loading) return (
    <View style={[s.container, { justifyContent: 'center' }]}>
      <ActivityIndicator color={C.accent} size="large" />
    </View>
  );

  return (
    <FlatList
      style={s.container}
      data={listings}
      keyExtractor={(l) => String(l.id)}
      contentContainerStyle={{ padding: 12 }}
      ListHeaderComponent={
        <TouchableOpacity style={s.postBtn} onPress={() => router.push('/post-ad' as any)}>
          <Text style={s.postBtnText}>+ Post New Ad</Text>
        </TouchableOpacity>
      }
      ListEmptyComponent={
        <View style={s.empty}>
          <Text style={{ fontSize: 40 }}>📋</Text>
          <Text style={{ color: C.textSub, fontSize: 14, marginTop: 12 }}>No ads posted yet</Text>
        </View>
      }
      renderItem={({ item: l }) => (
        <View style={s.adCard}>
          {/* Thumbnail */}
          {l.imageUrls && l.imageUrls.length > 0 ? (
            <Image source={{ uri: l.imageUrls[0] }} style={s.adImg} resizeMode="cover" />
          ) : (
            <View style={[s.adImg, s.adImgPlaceholder]}>
              <Text style={{ fontSize: 22, opacity: 0.2 }}>📷</Text>
            </View>
          )}

          <View style={s.adInfo}>
            <View style={s.adTopRow}>
              <Text style={s.adCat}>{l.categoryName}</Text>
              {l.boosted && (
                <View style={s.boostedBadge}>
                  <Text style={s.boostedBadgeText}>⚡ Boosted</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={() => router.push(`/listing/${l.id}` as any)}>
              <Text style={s.adTitle} numberOfLines={1}>{l.title}</Text>
            </TouchableOpacity>
            <Text style={s.adPrice}>{fmtPrice(l.price)}</Text>
            <Text style={s.adLocation} numberOfLines={1}>
              {l.location && l.city ? `${l.location}, ${l.city}` : l.city || 'India'}
            </Text>
            {l.viewCount > 0 && (
              <Text style={s.adViews}>👁 {l.viewCount} views</Text>
            )}
          </View>

          <View style={s.adRight}>
            <Text style={[s.adStatus, { color: l.status === 'ACTIVE' ? C.success : C.warning }]}>
              {l.status}
            </Text>
            {l.status === 'ACTIVE' && (
              <TouchableOpacity style={s.soldBtn} onPress={() => handleMarkSold(l.id)}>
                <Text style={s.soldBtnText}>Sold</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={s.delBtn} onPress={() => handleDelete(l.id)}>
              <Text style={s.delBtnText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  postBtn: {
    backgroundColor: C.accent, borderRadius: 10, paddingVertical: 12,
    alignItems: 'center', marginBottom: 14,
  },
  postBtnText: { color: '#07111e', fontWeight: '700', fontSize: 14 },
  adCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 12, marginBottom: 10,
  },
  adImg: {
    width: 68, height: 68, backgroundColor: '#f0f4f8', borderRadius: 8,
    flexShrink: 0, borderWidth: 1, borderColor: C.border,
  },
  adImgPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  adInfo: { flex: 1 },
  adTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  adCat: { fontSize: 9, color: C.accent, fontWeight: '700', textTransform: 'uppercase' },
  boostedBadge: {
    backgroundColor: 'rgba(0,200,224,0.12)', borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(0,200,224,0.25)',
  },
  boostedBadgeText: { color: C.accent, fontSize: 9, fontWeight: '700' },
  adTitle: { fontSize: 13, fontWeight: '600', color: C.text, marginTop: 2 },
  adPrice: { fontSize: 14, fontWeight: '800', color: C.text, marginTop: 2 },
  adLocation: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  adViews: { fontSize: 11, color: C.textSub, marginTop: 3 },
  adRight: { alignItems: 'flex-end', gap: 6 },
  adStatus: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  soldBtn: {
    backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)',
  },
  soldBtnText: { color: C.success, fontSize: 11, fontWeight: '700' },
  delBtn: { alignItems: 'center', padding: 4 },
  delBtnText: { fontSize: 18 },
  empty: { alignItems: 'center', paddingTop: 60 },
});
