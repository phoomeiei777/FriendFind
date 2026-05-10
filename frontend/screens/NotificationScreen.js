import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

export default function NotificationScreen({ navigation }) {
  const { apiFetch, token, authHeaders, updateMemberStatus, joinGroup } = useApp();
  const { theme, isDark } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);

  const fetchNotis = useCallback(async () => {
    try {
      const data = await apiFetch('/api/notifications', {
        headers: authHeaders(token),
      });
      setNotifications(data.notifications || []);
    } catch (e) {
      console.warn('fetchNotis error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [apiFetch, token, authHeaders]);

  useEffect(() => {
    fetchNotis();
  }, [fetchNotis]);

  const handleAction = async (item, action) => {
    try {
      if (item.type === 'join_request') {
        await updateMemberStatus(
          item.metadata.groupId,
          item.metadata.requesterId,
          action === 'accept' ? 'approved' : 'rejected'
        );
      } else if (item.type === 'group_invite' && action === 'accept') {
        await joinGroup(item.metadata.groupId);
        await updateMemberStatus(item.metadata.groupId, 'me', 'approved');
      }

      if (!String(item.id).startsWith('pending-')) {
        await apiFetch(`/api/notifications/${item.id}`, {
          method: 'DELETE',
          headers: authHeaders(token),
        });
      }

      Alert.alert('Success', 'Action completed!');
      fetchNotis();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const s = makeStyles(theme, isDark);

  const renderItem = ({ item }) => (
    <View style={[s.notiItem, !item.is_read && s.unreadItem]}>
      <View style={s.iconContainer}>
        <Ionicons
          name={item.type === 'group_invite' ? 'people' : 'person-add'}
          size={24}
          color="#F58882"
        />
      </View>
      <View style={s.contentContainer}>
        <Text style={s.notiText}>{item.content}</Text>
        <Text style={s.timeText}>{new Date(item.created_at).toLocaleString()}</Text>

        {(item.type === 'join_request' || item.type === 'group_invite') && (
          <View style={s.actionRow}>
            <TouchableOpacity style={[s.btn, s.acceptBtn]} onPress={() => handleAction(item, 'accept')}>
              <Text style={s.btnText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, s.declineBtn]} onPress={() => handleAction(item, 'decline')}>
              <Text style={[s.btnText, { color: theme.textMuted }]}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>

        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Notifications</Text>
          <View style={{ width: 44 }} />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#F58882" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderItem}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={s.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchNotis} tintColor="#F58882" />}
            ListEmptyComponent={
              <View style={s.empty}>
                <Ionicons name="notifications-off-outline" size={64} color={theme.iconMuted} />
                <Text style={s.emptyText}>ไม่มีการแจ้งเตือนใหม่</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const makeStyles = (theme, isDark) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  backBtn: {
    width: 44, height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 14,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 5 },
      android: { elevation: 3 },
    }),
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: theme.text },
  list: { padding: 16 },

  notiItem: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.05, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  unreadItem: { backgroundColor: isDark ? '#2A1E2E' : '#FFF9F9', borderColor: theme.border, borderWidth: 0.5 },
  iconContainer: {
    width: 48, height: 48,
    borderRadius: 15,
    backgroundColor: isDark ? '#3B2A2E' : '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: { flex: 1 },
  notiText:  { fontSize: 15, fontWeight: '600', color: theme.text, marginBottom: 4 },
  timeText:  { fontSize: 12, color: theme.textMuted, marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 8 },
  btn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  acceptBtn:  { backgroundColor: '#F58882' },
  declineBtn: { backgroundColor: theme.surfaceMuted },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },

  empty:     { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, color: theme.textMuted, fontWeight: '600' },
});
