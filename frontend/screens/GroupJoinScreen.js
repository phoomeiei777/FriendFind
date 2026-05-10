import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator,
  FlatList, Image, Modal, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

export default function GroupJoinScreen({ route, navigation }) {
  const { group: initialGroup } = route.params;
  const { activeSubject, joinGroup, fetchMatches, user: currentUser,
    fetchGroupMembers, updateMemberStatus, deleteGroup, leaveGroup } = useApp();
  const { theme, isDark } = useTheme();

  const [group, setGroup] = useState(initialGroup);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [joining, setJoining] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const isMember = (group.members || []).some(m => String(m.id) === String(currentUser?.id));
  const isAdmin = String(group.creator_id) === String(currentUser?.id) ||
    (group.members || []).find(m => String(m.id) === String(currentUser?.id))?.role === 'owner';

  const refreshGroupData = useCallback(async () => {
    try {
      const [membersData, pendingData] = await Promise.all([
        fetchGroupMembers(group.id, 'approved'),
        fetchGroupMembers(group.id, 'pending'),
      ]);
      setGroup(prev => ({ ...prev, members: membersData.members, member_count: membersData.count }));
      setPendingRequests((pendingData.members || []).filter(m => String(m.id) !== String(currentUser?.id)));
    } catch (e) { console.warn(e); }
  }, [group.id, fetchGroupMembers, currentUser?.id]);

  useEffect(() => {
    if (isAdmin) refreshGroupData();
  }, [isAdmin, refreshGroupData]);

  const loadFriends = useCallback(async () => {
    setLoadingFriends(true);
    try {
      const data = await fetchMatches();
      const memberIds = (group.members || []).map(m => String(m.id));
      setFriends((data.matches || []).filter(f => !memberIds.includes(String(f.id))));
    } catch (e) { console.warn(e); }
    finally { setLoadingFriends(false); }
  }, [fetchMatches, group.members]);

  const handleApprove = async (userId) => {
    setProcessingId(userId);
    try {
      await updateMemberStatus(group.id, userId, 'approved');
      Alert.alert('Success', 'Approved!');
      await refreshGroupData();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setProcessingId(null); }
  };

  const handleReject = async (userId) => {
    setProcessingId(userId);
    try {
      await updateMemberStatus(group.id, userId, 'rejected');
      await refreshGroupData();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setProcessingId(null); }
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      await joinGroup(group.id);
      Alert.alert('Success', 'ส่งคำขอเรียบร้อย!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setJoining(false); }
  };

  const handleDelete = () => Alert.alert('Delete Group', 'ลบกลุ่มนี้?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => {
      try { await deleteGroup(group.id); navigation.goBack(); }
      catch (e) { Alert.alert('Error', e.message); }
    }},
  ]);

  const handleLeave = () => Alert.alert('Leave Group', 'ออกจากกลุ่ม?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Leave', style: 'destructive', onPress: async () => {
      try { await leaveGroup(group.id); navigation.goBack(); }
      catch (e) { Alert.alert('Error', e.message); }
    }},
  ]);

  const s = makeStyles(theme, isDark);

  const renderMember = ({ item }) => (
    <View key={String(item.id)} style={s.memberRow}>
      <View style={s.memberAvatar}>
        {item.profile_image_url
          ? <Image source={{ uri: item.profile_image_url }} style={s.avatarImg} />
          : <Text style={s.avatarText}>{(item.username || '?').charAt(0).toUpperCase()}</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.memberUserName}>{item.username}</Text>
        <Text style={s.memberRole}>{item.role === 'owner' ? '👑 Leader' : 'Member'}</Text>
      </View>
    </View>
  );

  const renderPending = ({ item }) => (
    <View key={String(item.id)} style={[s.memberRow, s.pendingRow]}>
      <View style={s.memberAvatar}>
        {item.profile_image_url
          ? <Image source={{ uri: item.profile_image_url }} style={s.avatarImg} />
          : <Text style={s.avatarText}>{(item.username || '?').charAt(0).toUpperCase()}</Text>}
      </View>
      <Text style={[s.memberUserName, { flex: 1, marginLeft: 10 }]}>{item.username}</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {processingId === item.id ? <ActivityIndicator size="small" color="#F58882" /> : (
          <>
            <TouchableOpacity onPress={() => handleApprove(item.id)} style={s.acceptBtn}>
              <Ionicons name="checkmark" size={18} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleReject(item.id)} style={s.rejectBtn}>
              <Ionicons name="close" size={18} color="#FFF" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton}>
            <Ionicons name="chevron-back" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={s.headerTitle} numberOfLines={1}>{group.title}</Text>
          <View style={{ width: 28 }} />
        </View>

        <FlatList
          style={s.content}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={s.card}>
              <Text style={s.subjectCode}>{activeSubject?.subject_code} · {activeSubject?.subject_name}</Text>
              <Text style={s.description}>{group.description || 'No description provided'}</Text>

              <View style={s.statsRow}>
                <View style={s.statItem}>
                  <Text style={s.statVal}>{group.member_count || 0}</Text>
                  <Text style={s.statLabel}>Members</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.statItem}>
                  <Text style={s.statVal}>{group.member_limit || 5}</Text>
                  <Text style={s.statLabel}>Limit</Text>
                </View>
              </View>

              {isAdmin && pendingRequests.length > 0 && (
                <View style={{ marginBottom: 20 }}>
                  <Text style={[s.sectionTitle, { color: '#F58882', marginBottom: 10 }]}>
                    Pending Requests ({pendingRequests.length})
                  </Text>
                  {pendingRequests.map(item => renderPending({ item }))}
                </View>
              )}

              <View style={s.membersSection}>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionTitle}>Members</Text>
                  {isMember && (
                    <TouchableOpacity style={s.inviteBtn} onPress={() => { loadFriends(); setShowInviteModal(true); }}>
                      <Ionicons name="person-add" size={16} color="#FFF" />
                      <Text style={s.inviteBtnText}>Invite</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {(group.members || []).map(item => renderMember({ item }))}
              </View>

              {!isMember && (
                <TouchableOpacity style={s.joinButton} onPress={handleJoin} disabled={joining}>
                  {joining ? <ActivityIndicator color="#FFF" /> : <Text style={s.joinButtonText}>Request to Join</Text>}
                </TouchableOpacity>
              )}
              {isMember && (
                <TouchableOpacity style={[s.joinButton, { backgroundColor: '#374151' }]}
                  onPress={() => navigation.navigate('ChatDetail', { chatType: 'group', title: group.title, members: group.members, room_id: `group:${group.id}` })}>
                  <Text style={s.joinButtonText}>Open Group Chat</Text>
                </TouchableOpacity>
              )}
              {isAdmin && (
                <TouchableOpacity style={[s.joinButton, { backgroundColor: isDark ? '#3B1919' : '#FEE2E2', marginTop: 12 }]} onPress={handleDelete}>
                  <Text style={[s.joinButtonText, { color: '#EF4444' }]}>Delete Group</Text>
                </TouchableOpacity>
              )}
              {isMember && !isAdmin && (
                <TouchableOpacity style={[s.joinButton, { backgroundColor: theme.surfaceMuted, marginTop: 12 }]} onPress={handleLeave}>
                  <Text style={[s.joinButtonText, { color: theme.textMuted }]}>Leave Group</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />

        <Modal visible={showInviteModal} animationType="slide" transparent>
          <View style={s.modalOverlay}>
            <View style={s.modalContent}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Invite Friends</Text>
                <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
              {loadingFriends ? <ActivityIndicator color="#F58882" style={{ margin: 20 }} /> : (
                <FlatList
                  data={friends}
                  keyExtractor={item => String(item.id)}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={s.friendRow} onPress={() => { Alert.alert('Invited', `ส่งคำเชิญให้ ${item.username}!`); setShowInviteModal(false); }}>
                      <Image source={{ uri: item.profile_image_url || 'https://i.pravatar.cc/100' }} style={s.friendAvatar} />
                      <Text style={s.friendName}>{item.username}</Text>
                      <Ionicons name="add-circle" size={24} color="#F58882" />
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={<Text style={s.emptyText}>ไม่พบเพื่อนที่จะเชิญ</Text>}
                />
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const makeStyles = (theme, isDark) => StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: theme.text, flex: 1, textAlign: 'center' },
  backButton: { padding: 4 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  card: {
    backgroundColor: theme.surface, borderRadius: 30, padding: 24, marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: isDark ? 0.4 : 0.1, shadowRadius: 20 },
      android: { elevation: 5 },
    }),
  },
  subjectCode: { fontSize: 13, fontWeight: '700', color: '#F58882', marginBottom: 10, textTransform: 'uppercase' },
  description: { fontSize: 15, color: theme.textMuted, marginBottom: 20, lineHeight: 22 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, backgroundColor: theme.surfaceMuted, borderRadius: 20, padding: 15 },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: theme.text },
  statLabel: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: theme.border },
  membersSection: { flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
  inviteBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F58882', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 5 },
  inviteBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  memberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: theme.surfaceMuted, padding: 10, borderRadius: 15 },
  pendingRow: { borderColor: '#FECEE6', borderWidth: 1 },
  memberAvatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F58882', justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' },
  avatarImg: { width: 40, height: 40 },
  avatarText: { color: '#FFF', fontWeight: 'bold' },
  memberUserName: { fontSize: 15, fontWeight: '700', color: theme.text },
  memberRole: { fontSize: 11, color: theme.textMuted },
  joinButton: { backgroundColor: '#F58882', paddingVertical: 16, borderRadius: 20, alignItems: 'center', marginTop: 10 },
  joinButtonText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  acceptBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },
  rejectBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F44336', justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, height: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: theme.text },
  friendRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
  friendAvatar: { width: 44, height: 44, borderRadius: 15, marginRight: 15 },
  friendName: { flex: 1, fontSize: 16, fontWeight: '600', color: theme.text },
  emptyText: { textAlign: 'center', marginTop: 40, color: theme.textMuted },
});
