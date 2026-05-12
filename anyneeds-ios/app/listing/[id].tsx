import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { listingApi } from '../../services/api';

const C = {
  bg: '#0a1628', card: '#162040', border: '#1e3060',
  accent: '#00c8e0', text: '#fff', textSub: '#8899bb', textMuted: '#556080',
};

function fmtPrice(price: any) {
  if (!price) return 'Price on Request';
  return `₹${Number(price).toLocaleString('en-IN')}`;
}

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listingApi.getListing(Number(id))
      .then((r) => setListing(r.data))
      .catch(() => router.back())
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <View style={[s.container, { justifyContent: 'center' }]}>
      <ActivityIndicator color={C.accent} size="large" />
    </View>
  );

  if (!listing) return null;

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      {/* Image area */}
      <View style={s.imgArea}>
        {listing.imageUrls?.[0] ? (
          <Text style={{ fontSize: 60, textAlign: 'center' }}>🖼️</Text>
        ) : (
          <Text style={{ fontSize: 60, opacity: 0.2 }}>📷</Text>
        )}
        <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 8 }}>
          {listing.imageUrls?.length || 0} photo(s)
        </Text>
      </View>

      <View style={s.card}>
        <Text style={s.category}>{listing.categoryName}</Text>
        <Text style={s.title}>{listing.title}</Text>
        <Text style={s.price}>{fmtPrice(listing.price)}</Text>

        <View style={s.metaRow}>
          {listing.city && (
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Location</Text>
              <Text style={s.metaValue}>{listing.city}{listing.state ? `, ${listing.state}` : ''}</Text>
            </View>
          )}
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Status</Text>
            <Text style={[s.metaValue, { color: listing.status === 'ACTIVE' ? '#00e676' : '#ffab40' }]}>
              {listing.status}
            </Text>
          </View>
        </View>
      </View>

      {listing.description && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Description</Text>
          <Text style={s.desc}>{listing.description}</Text>
        </View>
      )}

      {listing.status === 'ACTIVE' && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Contact Seller</Text>
          <View style={s.sellerRow}>
            <View style={s.sellerAvatar}>
              <Text style={{ color: '#000', fontWeight: '800', fontSize: 20 }}>
                {(listing.user?.name || listing.user?.phoneNumber || 'S')[0].toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={s.sellerName}>{listing.user?.name || 'Seller'}</Text>
              <Text style={s.sellerSince}>AnyNeeds Member</Text>
            </View>
          </View>
          <TouchableOpacity
            style={s.callBtn}
            onPress={() => Linking.openURL(`tel:+91${listing.user?.phoneNumber}`)}
          >
            <Text style={s.callBtnText}>📞  Call Seller</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  imgArea: {
    height: 220, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center',
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  card: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 16, padding: 20, margin: 12, marginBottom: 0,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 12 },
  category: { fontSize: 11, color: C.accent, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 10 },
  price: { fontSize: 28, fontWeight: '800', color: C.accent, marginBottom: 14 },
  metaRow: { gap: 10 },
  metaItem: { flexDirection: 'row', justifyContent: 'space-between' },
  metaLabel: { fontSize: 13, color: C.textMuted },
  metaValue: { fontSize: 14, fontWeight: '600', color: C.text },
  desc: { color: C.textSub, fontSize: 14, lineHeight: 22 },
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  sellerAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: C.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  sellerName: { fontSize: 15, fontWeight: '600', color: C.text },
  sellerSince: { fontSize: 12, color: C.textMuted },
  callBtn: { backgroundColor: C.accent, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  callBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
});
