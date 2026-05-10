import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Header from '../components/Header';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

export default function ChatDetailScreen({ route, navigation }) {
  const {
    title = 'Chat',
    subTitle = '',
    members = [],
    chatType = 'private',
    room_id,
    target_user_id,
  } = route?.params || {};

  const { sendMessage: apiSendMessage, fetchMessages: apiFetchMessages, user: currentUser } = useApp();
  const { theme, isDark } = useTheme();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef();

  const resolvedRoomId = room_id || null;
  const resolvedTargetId = target_user_id || null;

  const loadMessages = useCallback(async () => {
    try {
      const data = await apiFetchMessages({
        room_id: resolvedRoomId,
        target_user_id: resolvedTargetId,
      });
      const normalized = (data.messages || []).map(m => ({
        id: m.id,
        sender: m.username,
        content: m.content,
        image_url: m.image_url,
        timestamp: new Date(m.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        isOwn: m.sender_id === currentUser?.id,
        avatar: (m.username || '?').charAt(0).toUpperCase(),
        profile_image_url: m.profile_image_url,
      }));
      setMessages(normalized);
    } catch (e) {
      console.warn('Failed to load messages:', e);
    } finally {
      setLoading(false);
    }
  }, [apiFetchMessages, resolvedRoomId, resolvedTargetId, currentUser?.id]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  const handleSendMessage = async (imgUri = null) => {
    if (!message.trim() && !imgUri) return;
    const text = message.trim();
    if (!imgUri) setMessage('');

    const tempMsg = {
      id: `temp_${Date.now()}`,
      sender: currentUser?.username || 'You',
      content: text,
      image_url: imgUri,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      avatar: (currentUser?.username || 'Y').charAt(0).toUpperCase(),
    };
    setMessages(prev => [...prev, tempMsg]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      await apiSendMessage({
        room_id: resolvedRoomId,
        target_user_id: resolvedTargetId,
        content: text,
        image_url: imgUri
      });
      loadMessages();
    } catch (e) {
      console.warn('Send message failed:', e);
    }
  };

  const pickImage = async () => {
    Alert.alert('แนบรูปภาพ', 'เลือกวิธีการ', [
      {
        text: 'ถ่ายรูป',
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) {
            Alert.alert('ต้องการสิทธิ์เข้าถึงกล้อง', 'กรุณาอนุญาตการเข้าถึงกล้องในการตั้งค่า');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.5,
          });
          if (!result.canceled) handleSendMessage(result.assets[0].uri);
        },
      },
      {
        text: 'เลือกจาก Gallery',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.5,
          });
          if (!result.canceled) handleSendMessage(result.assets[0].uri);
        },
      },
      { text: 'ยกเลิก', style: 'cancel' },
    ]);
  };

  const s = makeStyles(theme, isDark);

  const renderMessage = ({ item }) => (
    <View style={[s.messageRow, item.isOwn ? s.ownRow : s.otherRow]}>
      {!item.isOwn && (
        <View style={s.avatarContainer}>
          {item.profile_image_url
            ? <Image source={{ uri: item.profile_image_url }} style={s.avatarImg} />
            : <Text style={s.avatarText}>{item.avatar}</Text>
          }
        </View>
      )}
      <View style={[s.bubble, item.isOwn ? s.ownBubble : s.otherBubble, item.image_url && { padding: 4 }]}>
        {!item.isOwn && <Text style={s.senderName}>{item.sender}</Text>}

        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={s.messageImage} resizeMode="cover" />
        )}

        {item.content ? (
          <Text style={[s.messageText, item.isOwn && s.ownMessageText]}>{item.content}</Text>
        ) : null}

        <Text style={[s.timestamp, item.isOwn ? s.ownTimestamp : s.otherTimestamp]}>{item.timestamp}</Text>
      </View>
    </View>
  );

  return (
    <View style={[s.mainContainer, { backgroundColor: theme.surface }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      <Header
        title={title}
        subTitle={subTitle}
        backgroundColor={theme.surface}
        rightComponent={
          <TouchableOpacity style={s.memberButton}>
            <MaterialCommunityIcons name="account-multiple" size={22} color={theme.icon} />
          </TouchableOpacity>
        }
      />

      {/* Group members bar */}
      {members.length > 0 && chatType === 'group' && (
        <View style={s.membersBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.membersScroll}>
            {members.map((member, i) => (
              <View key={i} style={s.memberItem}>
                <View style={s.memberAvatar}>
                  {member?.profile_image_url
                    ? <Image source={{ uri: member.profile_image_url }} style={s.memberAvatarImg} />
                    : <Text style={s.memberAvatarText}>{member?.username?.charAt(0).toUpperCase() || '?'}</Text>
                  }
                </View>
                <Text style={s.memberName} numberOfLines={1}>{member?.name || member?.username}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
      <View style={s.blueDivider} />

      {/* ✅ KeyboardAvoidingView ครอบ chat + input */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Chat area */}
        <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={s.chatArea}>
          {loading ? (
            <ActivityIndicator size="large" color="#F58882" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => String(item.id)}
              contentContainerStyle={s.listContent}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
              ListEmptyComponent={<Text style={s.emptyText}>ยังไม่มีข้อความ เริ่มคุยเลย! 👋</Text>}
            />
          )}
        </LinearGradient>

        {/* Input */}
        <View style={s.inputSection}>
          <View style={s.inputRow}>
            <TouchableOpacity style={s.attachmentBtn} onPress={pickImage}>
              <Ionicons name="add-circle" size={32} color="#F58882" />
            </TouchableOpacity>

            <View style={s.inputContainer}>
              <TextInput
                style={s.textInput}
                placeholder="Aa"
                placeholderTextColor={theme.textMuted}
                value={message}
                onChangeText={setMessage}
                multiline
              />
              <TouchableOpacity style={s.emojiBtn}>
                <Ionicons name="happy-outline" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => handleSendMessage()}
              style={[s.sendBtn, !message.trim() && { backgroundColor: theme.surfaceMuted }]}
              disabled={!message.trim()}
            >
              <Ionicons name="send" size={20} color={message.trim() ? '#FFF' : theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const makeStyles = (theme, isDark) => StyleSheet.create({
  mainContainer: { flex: 1 },

  memberButton: {
    width: 38, height: 38,
    borderRadius: 10,
    backgroundColor: theme.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },

  membersBar: { backgroundColor: theme.surface, paddingVertical: 10, paddingHorizontal: 16 },
  membersScroll: { gap: 12, paddingRight: 8 },
  memberItem: { alignItems: 'center', gap: 6, width: 70 },
  memberAvatar: {
    width: 60, height: 60,
    borderRadius: 16,
    backgroundColor: '#F58882',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  memberAvatarImg: { width: 60, height: 60, borderRadius: 16 },
  memberAvatarText: { color: '#FFF', fontWeight: '700', fontSize: 20 },
  memberName: { fontSize: 11, color: theme.textMuted, width: 70, textAlign: 'center' },
  blueDivider: { height: 3, backgroundColor: '#4DB8FF' },

  chatArea: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 30 },
  emptyText: { textAlign: 'center', color: theme.textMuted, fontSize: 15, marginTop: 60 },

  messageRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  ownRow: { justifyContent: 'flex-end' },
  otherRow: { justifyContent: 'flex-start' },
  avatarContainer: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 2,
    overflow: 'hidden',
  },
  avatarImg: { width: 36, height: 36, borderRadius: 18 },
  avatarText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    maxWidth: '75%',
    backgroundColor: theme.surface,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 2,
  },
  ownBubble: { backgroundColor: '#F58882', borderBottomRightRadius: 2 },
  otherBubble: { borderBottomLeftRadius: 2 },
  senderName: { fontSize: 12, fontWeight: 'bold', color: '#F58882', marginBottom: 4 },
  messageText: { fontSize: 15, color: theme.text, lineHeight: 20 },
  ownMessageText: { color: '#FFF' },
  timestamp: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  ownTimestamp: { color: 'rgba(255,255,255,0.75)' },
  otherTimestamp: { color: theme.textMuted },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 14,
    marginBottom: 4,
  },

  inputSection: {
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  attachmentBtn: { padding: 2 },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceMuted,
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 5,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
    maxHeight: 100,
    paddingRight: 10,
  },
  emojiBtn: { padding: 2 },
  sendBtn: {
    width: 42, height: 42,
    borderRadius: 21,
    backgroundColor: '#F58882',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F58882',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});