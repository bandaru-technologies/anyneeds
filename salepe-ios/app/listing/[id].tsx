import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Linking, Image, Share, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { listingApi, wishlistApi, conversationApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const C = {
  bg: '#f5f7fa', card: '#ffffff', border: 'rgba(0,0,0,0.09)',
  accent: '#00c8e0', accentDark: '#07111e',
  text: '#1e293b', textSub: '#475569', textMuted: '#94a3b8',
  error: '#ef4444', success: '#22c55e', warning: '#f97316',
};

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'Brand New',
  LIKE_NEW: 'Like New',
  GOOD: 'Good',
  FAIR: 'Fair',
};

function fmtPrice(price: any) {
  if (!price) return 'Price on Request';
  return `₹${Number(price).toLocaleString('en-IN')}`;
}

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [saved, setSaved] = useState(false);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

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

  const images: string[] = listing.imageUrls || [];

  const handleToggleSave = async () => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please login to save listings', [
        { text: 'Login', onPress: () => router.push('/login' as any) },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    setSavingWishlist(true);
    try {
      await wishlistApi.toggle(listing.id);
      setSaved((prev) => !prev);
    } catch {
      Alert.alert('Error', 'Failed to update wishlist');
    } finally {
      setSavingWishlist(false);
    }
  };

  const handleWhatsAppShare = async () => {
    const priceText = listing.price ? `₹${Number(listing.price).toLocaleString('en-IN')}` : 'Price on Request';
    const city = listing.city || 'India';
    const message = `🏷 *${listing.title}*\n💰 ${priceText}\n📍 ${city}\n\nCheck it out on SalePe!`;
    try {
      await Share.share({ message });
    } catch {
      // share dialog dismissed
    }
  };

  const handleChatWithSeller = async () => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please login to chat with sellers', [
        { text: 'Login', onPress: () => router.push('/login' as any) },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    setChatLoading(true);
    try {
      await conversationApi.create(listing.id);
      Alert.alert(
        'Chat Started!',
        'Conversation started. Go to Messages to continue.',
        [
          { text: 'Go to Messages', onPress: () => router.push('/(tabs)/messages' as any) },
          { text: 'OK', style: 'cancel' },
        ]
      );
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Failed to start conversation';
      Alert.alert('Error', msg);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      {/* Image */}
      <View style={s.imgArea}>
        {images.length > 0 ? (
          <Image source={{ uri: images[activeImg] }} style={s.mainImg} resizeMode="cover" />
        ) : (
          <View style={s.imgPlaceholder}>
            <Text style={{ fontSize: 48, opacity: 0.2 }}>📷</Text>
          </View>
        )}
        {images.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.thumbRow} contentContainerStyle={{ gap: 8, padding: 8 }}>
            {images.map((url, i) => (
              <TouchableOpacity key={i} onPress={() => setActiveImg(i)}>
                <Image
                  source={{ uri: url }}
                  style={[s.thumb, i === activeImg && s.thumbActive]}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Save and Share buttons */}
        <View style={s.imgActions}>
          <TouchableOpacity style={s.imgActionBtn} onPress={handleToggleSave} disabled={savingWishlist}>
            <Text style={{ fontSize: 22 }}>{saved ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.imgActionBtn} onPress={handleWhatsAppShare}>
            <Text style={{ fontSize: 22 }}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main info */}
      <View style={s.card}>
        <Text style={s.category}>{listing.categoryName}</Text>
        <Text style={s.title}>{listing.title}</Text>
        <Text style={s.price}>{fmtPrice(listing.price)}</Text>

        <View style={s.divider} />

        {listing.negotiable && (
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>💬 Negotiable</Text>
            <Text style={[s.metaValue, { color: C.success }]}>✓ Negotiable</Text>
          </View>
        )}
        {listing.condition && (
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>🔖 Condition</Text>
            <Text style={s.metaValue}>{CONDITION_LABELS[listing.condition] || listing.condition}</Text>
          </View>
        )}
        {listing.location && (
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>🏘 Area</Text>
            <Text style={s.metaValue}>{listing.location}</Text>
          </View>
        )}
        {listing.city && (
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>📍 City</Text>
            <Text style={s.metaValue}>{listing.city}{listing.state ? `, ${listing.state}` : ''}</Text>
          </View>
        )}
        <View style={s.metaItem}>
          <Text style={s.metaLabel}>Status</Text>
          <Text style={[s.metaValue, { color: listing.status === 'ACTIVE' ? C.success : C.warning }]}>
            {listing.status}
          </Text>
        </View>
      </View>

      {/* Description */}
      {listing.description ? (
        <View style={s.card}>
          <Text style={s.cardTitle}>Description</Text>
          <Text style={s.desc}>{listing.description}</Text>
        </View>
      ) : null}

      {/* Contact */}
      {listing.status === 'ACTIVE' && (
        <View style={s.card}>
          <Text style={s.cardTitle}>Contact Seller</Text>
          <View style={s.sellerRow}>
            <View style={s.sellerAvatar}>
              <Text style={s.sellerAvatarText}>
                {(listing.user?.name || listing.user?.phoneNumber || 'S')[0].toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={s.sellerName}>{listing.user?.name || 'Seller'}</Text>
              <Text style={s.sellerSince}>SalePe Member</Text>
            </View>
          </View>
          <View style={s.contactBox}>
            <Text style={s.contactLabel}>📞 CONTACT NUMBER</Text>
            <Text style={s.contactNum}>+91 {listing.user?.phoneNumber}</Text>
          </View>

          {/* Chat with Seller */}
          <TouchableOpacity
            style={s.chatBtn}
            onPress={handleChatWithSeller}
            disabled={chatLoading}
          >
            <Text style={s.chatBtnText}>{chatLoading ? 'Starting Chat...' : '💬 Chat with Seller'}</Text>
          </TouchableOpacity>

          {/* WhatsApp share */}
          <TouchableOpacity
            style={s.whatsappBtn}
            onPress={handleWhatsAppShare}
          >
            <Text style={s.whatsappBtnText}>📤 Share via WhatsApp</Text>
          </TouchableOpacity>

          {/* Call */}
          <TouchableOpacity
            style={s.callBtn}
            onPress={() => Linking.openURL(`tel:+91${listing.user?.phoneNumber}`)}
          >
            <Text style={s.callBtnText}>📞 Call Seller</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  imgArea: { backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  mainImg: { width: '100%', height: 240 },
  imgPlaceholder: { height: 220, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4f8' },
  thumbRow: { maxHeight: 72 },
  thumb: { width: 60, height: 56, borderRadius: 6, borderWidth: 2, borderColor: 'transparent' },
  thumbActive: { borderColor: C.accent },
  imgActions: {
    position: 'absolute', top: 10, right: 10,
    flexDirection: 'row', gap: 8,
  },
  imgActionBtn: {
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20,
    width: 38, height: 38, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  card: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, padding: 18, margin: 12, marginBottom: 0,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 12 },
  category: { fontSize: 11, color: C.accent, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 8 },
  price: { fontSize: 26, fontWeight: '800', color: C.text, marginBottom: 14 },
  divider: { height: 1, backgroundColor: C.border, marginBottom: 12 },
  metaItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  metaLabel: { fontSize: 13, color: C.textMuted },
  metaValue: { fontSize: 13, fontWeight: '600', color: C.text },
  desc: { color: C.textSub, fontSize: 14, lineHeight: 22 },

  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  sellerAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,200,224,0.12)', borderWidth: 1, borderColor: 'rgba(0,200,224,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  sellerAvatarText: { color: C.accent, fontWeight: '800', fontSize: 18 },
  sellerName: { fontSize: 14, fontWeight: '600', color: C.text },
  sellerSince: { fontSize: 12, color: C.textMuted },
  contactBox: {
    backgroundColor: 'rgba(0,200,224,0.05)', borderWidth: 1, borderColor: 'rgba(0,200,224,0.2)',
    borderRadius: 10, padding: 12, marginBottom: 12,
  },
  contactLabel: { fontSize: 10, fontWeight: '700', color: C.textMuted, letterSpacing: 0.5, marginBottom: 4 },
  contactNum: { fontSize: 20, fontWeight: '800', color: C.accent },
  chatBtn: {
    backgroundColor: 'rgba(0,200,224,0.1)', borderWidth: 1.5, borderColor: C.accent,
    borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginBottom: 10,
  },
  chatBtnText: { color: C.accent, fontWeight: '700', fontSize: 15 },
  whatsappBtn: {
    backgroundColor: 'rgba(34,197,94,0.08)', borderWidth: 1.5, borderColor: 'rgba(34,197,94,0.4)',
    borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginBottom: 10,
  },
  whatsappBtnText: { color: C.success, fontWeight: '700', fontSize: 15 },
  callBtn: { backgroundColor: C.accent, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  callBtnText: { color: '#07111e', fontWeight: '700', fontSize: 15 },
});
