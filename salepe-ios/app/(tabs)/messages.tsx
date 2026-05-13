import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { conversationApi } from '../../services/api';

const C = {
  bg: '#f5f7fa', card: '#ffffff', border: 'rgba(0,0,0,0.09)',
  accent: '#00c8e0', accentDark: '#07111e',
  text: '#1e293b', textSub: '#475569', textMuted: '#94a3b8',
  error: '#ef4444', success: '#22c55e', warning: '#f97316',
};

function getInitials(name?: string, phone?: string): string {
  if (name && name.trim()) return name.trim()[0].toUpperCase();
  if (phone) return phone.slice(-2);
  return 'S';
}

export default function MessagesScreen() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const { data } = await conversationApi.getAll();
      const items = Array.isArray(data) ? data : (data.content || []);
      setConversations(items);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  if (!isLoggedIn) {
    return (
      <View style={s.centered}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>💬</Text>
        <Text style={{ color: C.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Your Messages</Text>
        <Text style={{ color: C.textSub, fontSize: 14, marginBottom: 28, textAlign: 'center', lineHeight: 20 }}>
          Login to view your conversations with sellers
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
      data={conversations}
      keyExtractor={(c) => String(c.id)}
      contentContainerStyle={{ paddingVertical: 8, paddingBottom: 80 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.accent} />
      }
      renderItem={({ item: conv }) => {
        const sellerName = conv.otherUser?.name || conv.seller?.name || conv.sellerName;
        const sellerPhone = conv.otherUser?.phoneNumber || conv.seller?.phoneNumber;
        const listingTitle = conv.listing?.title || conv.listingTitle || 'Listing';
        const lastMessage = conv.lastMessage || conv.lastMessagePreview || '';
        const unreadCount = conv.unreadCount || 0;

        return (
          <TouchableOpacity
            style={s.convRow}
            onPress={() => router.push(`/messages/${conv.id}` as any)}
          >
            {/* Avatar */}
            <View style={s.avatar}>
              <Text style={s.avatarText}>{getInitials(sellerName, sellerPhone)}</Text>
            </View>

            {/* Info */}
            <View style={s.convInfo}>
              <View style={s.convTopRow}>
                <Text style={s.convName} numberOfLines={1}>
                  {sellerName || 'Seller'}
                </Text>
                {unreadCount > 0 && (
                  <View style={s.unreadDot}>
                    <Text style={s.unreadDotText}>{unreadCount}</Text>
                  </View>
                )}
              </View>
              <Text style={s.convListing} numberOfLines={1}>{listingTitle}</Text>
              {lastMessage ? (
                <Text style={s.convLastMsg} numberOfLines={1}>{lastMessage}</Text>
              ) : null}
            </View>

            <Text style={{ color: C.accent, fontSize: 16, marginLeft: 4 }}>→</Text>
          </TouchableOpacity>
        );
      }}
      ItemSeparatorComponent={() => <View style={s.separator} />}
      ListEmptyComponent={
        <View style={s.empty}>
          <Text style={{ fontSize: 40 }}>💬</Text>
          <Text style={{ color: C.textSub, fontSize: 14, marginTop: 12, marginBottom: 20 }}>
            No conversations yet
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
  convRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.card, paddingHorizontal: 16, paddingVertical: 14,
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(0,200,224,0.12)', borderWidth: 1, borderColor: 'rgba(0,200,224,0.25)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarText: { color: C.accent, fontWeight: '800', fontSize: 18 },
  convInfo: { flex: 1 },
  convTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  convName: { fontSize: 14, fontWeight: '700', color: C.text, flex: 1 },
  unreadDot: {
    backgroundColor: C.accent, borderRadius: 10, minWidth: 20, height: 20,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  unreadDotText: { color: '#07111e', fontSize: 11, fontWeight: '800' },
  convListing: { fontSize: 12, color: C.textSub, marginTop: 2 },
  convLastMsg: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  separator: { height: 1, backgroundColor: C.border, marginLeft: 74 },
  empty: { alignItems: 'center', paddingTop: 80 },
});
