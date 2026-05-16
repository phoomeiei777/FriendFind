import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import StatusBadge from '../components/StatusBadge';

export default function GroupClassScreen({ navigation }) {
  const { activeSubject, fetchGroups, createGroup, user } = useApp();
  const { theme, isDark } = useTheme();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [memberLimit, setMemberLimit] = useState('5');
  const [creating, setCreating] = useState(false);

  const loadGroups = useCallback(async () => {
    try {
      const data = await fetchGroups(activeSubject?.id);
      setGroups(data.groups || []);
    } catch (error) {
      console.warn("Failed to load groups:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeSubject, fetchGroups]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const onRefresh = () => {
    setRefreshing(true);
    loadGroups();
  };

  const handleCreateGroup = async () => {
    if (!title.trim()) {
      alert('Please enter a group title');
      return;
    }
    setCreating(true);
    try {
      await createGroup({
        subject_id: activeSubject.id,
        title: title.trim(),
        description: description.trim(),
        member_limit: parseInt(memberLimit) || 5,
      });
      setModalVisible(false);
      setTitle('');
      setDescription('');
      setMemberLimit('5');
      setLoading(true);
      loadGroups();
    } catch (error) {
      alert("Failed to create group: " + (error.message || "Unknown error"));
    } finally {
      setCreating(false);
    }
  };

  const s = makeStyles(theme, isDark);

  const renderGroupCard = ({ item, index }) => {
    const isHot = item.member_count >= 3;
    const realMembers = item.members || [];
    const isOwner = item.my_role === 'owner' || item.creator_id === user?.id;

    return (
      <TouchableOpacity
        style={s.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('GroupJoin', { group: item })}
      >
        <View style={s.cardHeader}>
          <Text style={s.cardTitle}>{item.title}</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {isOwner && <StatusBadge status="info" text="OWNER" />}
            {isHot && <StatusBadge status="hot" text="HOT" />}
          </View>
        </View>

        <Text style={s.cardDetail} numberOfLines={2}>
          {item.subject_code} · {item.description || 'No description'}
        </Text>
        <Text style={s.membersLabel}>Members ({item.member_count || 0}/{item.member_limit || 5})</Text>
        <View style={s.cardFooter}>
          <View style={s.membersRow}>
            {realMembers.slice(0, 5).map((m, i) => (
              <View key={i} style={[s.memberAvatar, { marginRight: -8, zIndex: 5 - i }]}>
                {m.profile_image_url ? (
                  <Image source={{ uri: m.profile_image_url }} style={{ width: '100%', height: '100%', borderRadius: 18 }} />
                ) : (
                  <Text style={s.avatarText}>{(m.username || '?').charAt(0).toUpperCase()}</Text>
                )}
              </View>
            ))}
            {realMembers.length === 0 && (
              <Text style={{ color: '#9CA3AF', fontSize: 13 }}>ยังไม่มีสมาชิก</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{flex: 1}}>
      <SafeAreaView style={s.container} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton}>
            <Ionicons name="chevron-back" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: theme.text }]}>{activeSubject?.subject_code || 'Subject'}</Text>
        </View>

        <View style={s.subHeader}>
          <Text style={[s.sectionTitle, { color: theme.textMuted }]}>Group Hub</Text>
          <TouchableOpacity style={s.createButton} onPress={() => setModalVisible(true)}>
            <Text style={s.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#F58882" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderGroupCard}
            contentContainerStyle={s.listContent}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
              <Text style={[s.emptyText, { color: theme.textMuted }]}>No groups found. Be the first to create one!</Text>
            }
          />
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={s.modalOverlay}>
              <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={s.modalContent}
              >
                <View style={s.modalHeader}>
                  <Text style={s.modalTitle}>Create New Group</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>

                <Text style={s.inputLabel}>Group Title</Text>
                <TextInput
                  style={s.input}
                  placeholder="e.g. หาทำงานกลุ่ม"
                  placeholderTextColor={theme.textMuted}
                  value={title}
                  onChangeText={setTitle}
                />

                <Text style={s.inputLabel}>Description / Detail</Text>
                <TextInput
                  style={[s.input, s.textArea]}
                  placeholder="e.g. หาเพื่อนทำงานรายวิชานี้"
                  placeholderTextColor={theme.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                />

                <View style={s.memberLimitSection}>
                  <Text style={s.inputLabel}>Members</Text>
                  <View style={s.memberPreviewRow}>
                    {Array.from({ length: parseInt(memberLimit) || 5 }).map((_, i) => (
                      <View key={i} style={s.previewAvatar} />
                    ))}
                    <TouchableOpacity
                      style={s.addButton}
                      onPress={() => {
                        const tempGroup = {
                          id: null,
                          title: title.trim() || 'New Group',
                          member_limit: parseInt(memberLimit) || 5,
                          isCreating: true,
                        };
                        navigation.navigate('GroupAddMember', { group: tempGroup });
                      }}
                    >
                      <Text style={s.addButtonText}>add</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={s.memberLimitInputRow}>
                    <Text style={s.memberLimitLabel}>Member Limit:</Text>
                    <TextInput
                      style={s.memberLimitInput}
                      placeholder="5"
                      placeholderTextColor={theme.textMuted}
                      value={memberLimit}
                      onChangeText={setMemberLimit}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={s.submitButton} 
                  onPress={handleCreateGroup}
                  disabled={creating}
                >
                  {creating ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={s.submitButtonText}>Create Group</Text>
                  )}
                </TouchableOpacity>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const makeStyles = (theme, isDark) => StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { padding: 4, marginRight: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800' },
  subHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginTop: 10, marginBottom: 20 },
  sectionTitle: { fontSize: 22, fontWeight: '600' },
  createButton: { backgroundColor: '#F58882', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  createButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  listContent: { paddingHorizontal: 24, paddingBottom: 40 },
  card: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: isDark ? 1 : 0,
    borderColor: 'rgba(255,255,255,0.15)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.05, shadowRadius: 5 },
      android: { elevation: 2 },
    }),
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: theme.text, flex: 1 },
  hotBadge: { backgroundColor: '#FF0000', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 8 },
  hotBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  cardDetail: { fontSize: 13, color: theme.textMuted, marginBottom: 12 },
  membersLabel: { fontSize: 13, fontWeight: '600', color: theme.textMuted, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', alignItems: 'center' },
  membersRow: { flexDirection: 'row', alignItems: 'center' },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: theme.surface },
  avatarText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: theme.text },
  inputLabel: { fontSize: 14, fontWeight: '600', color: theme.textMuted, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: theme.surfaceMuted,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#F58882', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  memberLimitSection: { marginTop: 12 },
  memberPreviewRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, marginTop: 10 },
  previewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#374151', marginRight: 8, borderWidth: 1.5, borderColor: theme.surface },
  addButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: theme.surface },
  addButtonText: { color: '#FFF', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  memberLimitInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.surfaceMuted,
    borderRadius: 12,
  },
  memberLimitLabel: { fontSize: 14, fontWeight: '600', color: theme.textMuted },
  memberLimitInput: { width: 50, fontSize: 14, fontWeight: '600', color: theme.text, textAlign: 'center' },
});
