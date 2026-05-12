import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { listingApi } from '../../services/api';

const C = {
  bg: '#0a1628', card: '#162040', border: '#1e3060',
  accent: '#00c8e0', text: '#fff', textSub: '#8899bb', textMuted: '#556080',
  error: '#ff5252', success: '#00e676', warning: '#ffab40',
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
      .then((r) => setListings(r.data.content || []))
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
          <Text style={{ color: C.textSub, fontSize: 14, marginTop: 12 }}>
            No ads posted yet
          </Text>
        </View>
      }
      renderItem={({ item: l }) => (
        <View style={s.adCard}>
          <View style={s.adImg}>
            <Text style={{ fontSize: 24, opacity: 0.25 }}>📷</Text>
          </View>
          <View style={s.adInfo}>
            <Text style={s.adCat}>{l.categoryName}</Text>
            <TouchableOpacity onPress={() => router.push(`/listing/${l.id}` as any)}>
              <Text style={s.adTitle} numberOfLines={2}>{l.title}</Text>
            </TouchableOpacity>
            <Text style={s.adPrice}>{fmtPrice(l.price)}</Text>
            <Text style={[
              s.adStatus,
              { color: l.status === 'ACTIVE' ? C.success : C.warning }
            ]}>
              {l.status}
            </Text>
          </View>
          <View style={s.adActions}>
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
    alignItems: 'center', marginBottom: 16,
  },
  postBtnText: { color: '#000', fontWeight: '700', fontSize: 14 },
  adCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, padding: 12, marginBottom: 12,
  },
  adImg: {
    width: 72, height: 60, backgroundColor: C.bg, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  adInfo: { flex: 1 },
  adCat: { fontSize: 9, color: C.accent, fontWeight: '700', textTransform: 'uppercase' },
  adTitle: { fontSize: 13, fontWeight: '600', color: C.text },
  adPrice: { fontSize: 14, fontWeight: '800', color: C.accent, marginTop: 2 },
  adStatus: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  adActions: { gap: 6 },
  soldBtn: {
    backgroundColor: 'rgba(0,230,118,0.15)', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  soldBtnText: { color: C.success, fontSize: 11, fontWeight: '700' },
  delBtn: { alignItems: 'center', padding: 4 },
  delBtnText: { fontSize: 18 },
  empty: { alignItems: 'center', paddingTop: 60 },
});
