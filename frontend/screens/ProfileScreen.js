import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const { user } = useApp();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();

  const displayName = user?.username || 'Guest';
  const initial = displayName.charAt(0).toUpperCase();
  const s = makeStyles(theme, isDark);

  const renderFunFact = (label, value) => (
    <View style={s.infoCard}>
      <View style={s.infoTextBlock}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe} edges={['top']}>

        {/* Header */}
        <View style={s.header}>
          <Image source={require('../assets/image.png')} style={{ width: 60, height: 60 }} resizeMode="contain" />
          <Text style={s.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Setting')} style={s.settingsBtn}>
            <Ionicons name="settings-sharp" size={22} color={theme.icon} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

          {/* Avatar */}
          <View style={s.profileContainer}>
            {user?.profile_image_url ? (
              <Image source={{ uri: user.profile_image_url }} style={s.avatarImg} />
            ) : (
              <View style={s.avatar}>
                <Text style={s.avatarText}>{initial}</Text>
              </View>
            )}
            <Text style={s.name}>{displayName}</Text>
            {user?.email ? <Text style={s.email}>{user.email}</Text> : null}

            <TouchableOpacity style={s.editButton} activeOpacity={0.8} onPress={() => navigation.navigate('EditProfile')}>
              <Ionicons name="pencil" size={14} color={theme.text} style={{ marginRight: 4 }} />
              <Text style={s.editButtonText}>Edit profile</Text>
            </TouchableOpacity>
          </View>

          {/* Info Cards */}
          <View style={s.infoSection}>
            {user?.faculty && (
              <View style={s.infoCard}>
                <Ionicons name="school-outline" size={20} color="#F58882" />
                <View style={s.infoTextBlock}>
                  <Text style={s.infoLabel}>Faculty</Text>
                  <Text style={s.infoValue}>{user.faculty}</Text>
                </View>
              </View>
            )}
            {user?.year && (
              <View style={s.infoCard}>
                <Ionicons name="calendar-outline" size={20} color="#F58882" />
                <View style={s.infoTextBlock}>
                  <Text style={s.infoLabel}>Year</Text>
                  <Text style={s.infoValue}>Year {user.year}</Text>
                </View>
              </View>
            )}
            {user?.phone && (
              <View style={s.infoCard}>
                <Ionicons name="call-outline" size={20} color="#F58882" />
                <View style={s.infoTextBlock}>
                  <Text style={s.infoLabel}>Phone</Text>
                  <Text style={s.infoValue}>{user.phone}</Text>
                </View>
              </View>
            )}
            {user?.pronouns && (
              <View style={s.infoCard}>
                <Ionicons name="person-outline" size={20} color="#F58882" />
                <View style={s.infoTextBlock}>
                  <Text style={s.infoLabel}>Pronouns</Text>
                  <Text style={s.infoValue}>{user.pronouns}</Text>
                </View>
              </View>
            )}

            {user?.gender && (
              <View style={s.infoCard}>
                <Ionicons name="male-female-outline" size={20} color="#F58882" />
                <View style={s.infoTextBlock}>
                  <Text style={s.infoLabel}>Gender</Text>
                  <Text style={s.infoValue}>{user.gender}</Text>
                </View>
              </View>
            )}

            {user?.study_goal && (
              <View style={s.infoCard}>
                <Ionicons name="flag-outline" size={20} color="#F58882" />
                <View style={s.infoTextBlock}>
                  <Text style={s.infoLabel}>Study Goal</Text>
                  <Text style={s.infoValue}>{user.study_goal}</Text>
                </View>
              </View>
            )}

            {user?.interests && (
              <View style={s.infoCard}>
                <Ionicons name="heart-outline" size={20} color="#F58882" />
                <View style={s.infoTextBlock}>
                  <Text style={s.infoLabel}>About me</Text>
                  <Text style={s.infoValue}>{user.interests}</Text>
                </View>
              </View>
            )}

            {/* Fun Facts in Profile */}
            <Text style={s.sectionTitle}>Fun Facts</Text>
            <View style={{ gap: 10 }}>
              {user?.study_style && renderFunFact('Study Style', user.study_style)}
              {user?.study_time && renderFunFact('Study Time', user.study_time)}
              {user?.study_location && renderFunFact('Study Location', user.study_location)}
              {user?.study_vibe && renderFunFact('Study Vibe', user.study_vibe)}
              {user?.strength && renderFunFact('Strength', user.strength)}
              {user?.weakness && renderFunFact('Weakness', user.weakness)}
            </View>

            {/* Photo Gallery */}
            <Text style={[s.sectionTitle, { marginTop: 10 }]}>Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.photoGallery}>
              {user?.images?.map((img, i) => (
                <Image key={i} source={{ uri: img }} style={s.galleryImg} />
              )) || (
                user?.profile_image_url && <Image source={{ uri: user.profile_image_url }} style={s.galleryImg} />
              )}
            </ScrollView>
          </View>
        </ScrollView>
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
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: theme.text },
  settingsBtn: {
    padding: 8,
    backgroundColor: theme.surface,
    borderRadius: 14,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 5 },
      android: { elevation: 3 },
    }),
  },

  // ─── Profile ─────────────────────────────────────────────
  profileContainer: { alignItems: 'center', marginTop: 30, paddingHorizontal: 20 },
  avatar: {
    width: 110, height: 110,
    borderRadius: 55,
    backgroundColor: '#F58882',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#F58882',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarImg: {
    width: 110, height: 110,
    borderRadius: 55,
    marginBottom: 16,
  },
  avatarText: { color: '#FFF', fontSize: 44, fontWeight: '700' },
  name:  { fontSize: 26, fontWeight: '800', color: theme.text, marginBottom: 4 },
  email: { fontSize: 14, color: theme.textMuted, marginBottom: 14 },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
    marginBottom: 4,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.1, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  editButtonText: { fontSize: 14, fontWeight: '700', color: theme.text },

  // ─── Info Cards ──────────────────────────────────────────
  infoSection: { marginTop: 24, paddingHorizontal: 20, gap: 12 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.06, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  infoTextBlock: { flex: 1 },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: { fontSize: 15, fontWeight: '700', color: theme.text, marginTop: 2 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  photoGallery: {
    gap: 10,
    paddingBottom: 10,
  },
  galleryImg: {
    width: 120,
    height: 160,
    borderRadius: 12,
    backgroundColor: theme.surfaceMuted,
  },
});