import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export default function GroupDiscoveryScreen() {
  const { activeSubject, fetchMyGroups, fetchMatches } = useApp();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();

  const [groups, setGroups]         = useState([]);
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('friends');
  const [error, setError]           = useState('');

  const load = useCallback(async () => {
    try {
      const subjectId = activeSubject?.id;
      const [groupData, matchData] = await Promise.all([
        fetchMyGroups(subjectId),
        fetchMatches(),
      ]);
      setGroups(groupData.groups || []);
      setUsers(matchData.matches || []);
      setError('');
    } catch (e) {
      console.warn(e);
      setGroups([]);
      setUsers([]);
      setError('Unable to load chat list.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeSubject, fetchMyGroups, fetchMatches]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleOpenPrivateChat = (user) => {
    navigation.navigate('ChatDetail', {
      chatType: 'private',
      title: user.username || user.name || 'Friend',
      subTitle: user.email || '',
      members: [],
      target_user_id: user.id,
    });
  };

  const handleOpenGroupChat = (group) => {
    navigation.navigate('ChatDetail', {
      chatType: 'group',
      title: group.title || group.subject_name || 'Group Chat',
      subTitle: group.subject_name || '',
      members: group.members || [],
      room_id: `group:${group.id}`,
    });
  };

  const activeData = selectedTab === 'friends' ? users : groups;
  const emptyText  = selectedTab === 'friends'
    ? 'ยังไม่มีเพื่อน \nไปปัดหา Study Buddy กันก่อนเลย! 💕'
    : 'No group chats available.';

  const s = makeStyles(theme, isDark);

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe} edges={['top']}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Chat</Text>
          <TouchableOpacity style={s.bellBtn} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={22} color={theme.icon} />
            <View style={s.dot} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={s.tabRow}>
          <TouchableOpacity
            style={[s.tabItem, selectedTab === 'friends' && s.tabSelected]}
            onPress={() => setSelectedTab('friends')}
          >
            <Text style={[s.tabText, selectedTab === 'friends' && s.tabTextSelected]}>Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tabItem, selectedTab === 'groups' && s.tabSelected]}
            onPress={() => setSelectedTab('groups')}
          >
            <Text style={[s.tabText, selectedTab === 'groups' && s.tabTextSelected]}>Groups</Text>
          </TouchableOpacity>
        </View>

        {/* Friends avatar row */}
        {selectedTab === 'friends' && users.length > 0 && (
          <View style={s.membersBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.membersScroll}>
              {users.map((user, i) => (
                <TouchableOpacity key={i} style={s.memberItem} onPress={() => handleOpenPrivateChat(user)}>
                  <View style={s.memberAvatar}>
                    {user?.profile_image_url
                      ? <Image source={{ uri: user.profile_image_url }} style={s.memberAvatarImg} />
                      : <Text style={s.memberAvatarText}>
                          {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || '?'}
                        </Text>
                    }
                  </View>
                  <Text style={s.memberName} numberOfLines={1}>{user?.name || user?.username}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {error ? <Text style={s.err}>{error}</Text> : null}

        {loading ? (
          <ActivityIndicator size="large" color={theme.button} style={{ marginTop: 24 }} />
        ) : (
          <FlatList
            data={activeData}
            keyExtractor={(item, index) => String(item.id ?? item.title ?? index)}
            contentContainerStyle={s.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.button} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={s.chatCard}
                onPress={() => selectedTab === 'friends' ? handleOpenPrivateChat(item) : handleOpenGroupChat(item)}
              >
                {/* Avatar */}
                <View style={s.avatarWrap}>
                  {item?.profile_image_url ? (
                    <Image source={{ uri: item.profile_image_url }} style={s.avatarImg} />
                  ) : (
                    <View style={s.avatar}>
                      <Text style={s.avatarInitial}>
                        {selectedTab === 'friends'
                          ? (item.username || item.name || '?').charAt(0).toUpperCase()
                          : (item.title || item.subject_name || '?').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}

                  {/* Group member badge */}
                  {selectedTab === 'groups' && item.member_count > 0 && (
                    <View style={s.memberBadge}>
                      <Text style={s.memberBadgeText}>{item.member_count}</Text>
                    </View>
                  )}

                  {/* Unread badge (placeholder) */}
                  {selectedTab === 'friends' && (
                    <View style={[s.memberBadge, { backgroundColor: '#FF4D4D', right: -2, top: -2, width: 18, height: 18 }]}>
                      <Text style={[s.memberBadgeText, { fontSize: 9 }]}>1</Text>
                    </View>
                  )}
                </View>

                {/* Chat info */}
                <View style={s.chatContent}>
                  <Text style={s.chatName}>
                    {selectedTab === 'friends'
                      ? item.username || item.name || 'Friend'
                      : item.title || item.subject_name || 'Group Chat'}
                  </Text>
                  <Text style={s.chatLast}>
                    {selectedTab === 'friends'
                      ? (() => {
                          if (item.matched_at) {
                            const d = new Date(item.matched_at);
                            return `❤️ Matched · ${d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })}`;
                          }
                          return item.email || 'Study Buddy';
                        })()
                      : item.subject_name
                        ? `${item.subject_name} · ${item.member_count || 0} members`
                        : 'Group conversation'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={s.empty}>{emptyText}</Text>}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const makeStyles = (theme, isDark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },

  // ─── Header ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    minHeight: 80,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.text,
  },
  bellBtn: {
    padding: 8,
    backgroundColor: theme.surface,
    borderRadius: 14,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 5 },
      android: { elevation: 3 },
    }),
  },
  dot: {
    position: 'absolute',
    top: 7, right: 7,
    width: 12, height: 12,
    borderRadius: 50,
    backgroundColor: '#F43F5E',
    borderWidth: 1.5,
    borderColor: theme.surface,
  },

  // ─── Tabs ─────────────────────────────────────────────────
  tabRow: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: theme.surfaceMuted,
  },
  tabSelected: {
    backgroundColor: theme.surface,
    borderBottomWidth: 3,
    borderBottomColor: theme.button,
  },
  tabText: {
    color: theme.textMuted,
    fontSize: 16,
    fontWeight: '700',
  },
  tabTextSelected: {
    color: theme.text,
  },

  // ─── Friends avatar row ───────────────────────────────────
  membersBar: { paddingVertical: 12, paddingHorizontal: 16 },
  membersScroll: { gap: 12, paddingRight: 8 },
  memberItem: { alignItems: 'center', gap: 6, width: 120 },
  memberAvatar: {
    width: 120, height: 150,
    borderRadius: 16,
    backgroundColor: '#F58882',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  memberAvatarImg:  { width: 120, height: 150, borderRadius: 16 },
  memberAvatarText: { color: '#FFF', fontWeight: '700', fontSize: 20 },
  memberName: { fontSize: 11, color: theme.textMuted, width: 70, textAlign: 'center' },

  // ─── Chat List ────────────────────────────────────────────
  err:  { color: '#c00', marginHorizontal: 20, marginTop: 10 },
  list: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 12 },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 12 },
      android: { elevation: 2 },
    }),
  },
  avatarWrap:    { position: 'relative', marginRight: 14 },
  avatar: {
    width: 52, height: 52,
    borderRadius: 100,
    backgroundColor: '#F58882',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg:     { width: 52, height: 52, borderRadius: 26 },
  avatarInitial: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  memberBadge: {
    position: 'absolute',
    bottom: -2, right: -2,
    backgroundColor: '#4DB8FF',
    borderRadius: 10,
    minWidth: 20, height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: theme.surface,
  },
  memberBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  chatContent:     { flex: 1 },
  chatName: { fontSize: 18, fontWeight: '700', color: theme.text },
  chatLast: { marginTop: 6, fontSize: 14, color: theme.textMuted },
  empty:    { textAlign: 'center', color: theme.textMuted, padding: 24 },
});