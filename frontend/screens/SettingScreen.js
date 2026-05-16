import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/Header';

export default function SettingScreen() {
  const navigation = useNavigation();
  const { user, logout, deleteAccount } = useApp();
  const { isDark, toggleTheme, theme } = useTheme();

  const username = user?.username || 'Username';
  const phone    = user?.phone    || '08x-xxxx-xxx';
  const email    = user?.email    || 'Email';

  const handleLogout = () => {
    logout();
    navigation.reset({ index: 0, routes: [{ name: 'Loader' }] });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is permanent and all your data will be removed.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteAccount();
              navigation.reset({ index: 0, routes: [{ name: 'Loader' }] });
            } catch (e) {
              Alert.alert("Error", "Failed to delete account. Please try again.");
            }
          } 
        }
      ]
    );
  };

  const s = makeStyles(theme, isDark);

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe} edges={['bottom', 'left', 'right']}>
        <Header title="Setting" />

        <ScrollView contentContainerStyle={s.scrollContent}>

          {/* ── Account Info ── */}
          <Text style={s.sectionLabel}>Account</Text>
          <View style={s.card}>
            <InfoRow icon="person-outline" label="Username" value={username} theme={theme} s={s} />
            <View style={s.divider} />
            <InfoRow icon="call-outline"   label="Phone"    value={phone}    theme={theme} s={s} />
            <View style={s.divider} />
            <InfoRow icon="mail-outline"   label="Email"    value={email}    theme={theme} s={s} />
          </View>

          {/* ── Preferences ── */}
          <Text style={s.sectionLabel}>Preferences</Text>
          <View style={s.card}>
            <View style={s.row}>
              <View style={s.rowLeft}>
                <View style={[s.iconBox, { backgroundColor: isDark ? '#3B3B6E' : '#EEF2FF' }]}>
                  <Ionicons name={isDark ? 'moon' : 'sunny-outline'} size={20} color={isDark ? '#818CF8' : '#F59E0B'} />
                </View>
                <Text style={s.rowLabel}>Dark Mode</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
                thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#D1D5DB"
              />
            </View>
          </View>

          {/* ── Actions ── */}
          <Text style={s.sectionLabel}>Account Actions</Text>
          <View style={s.card}>
            <TouchableOpacity style={s.row} onPress={handleLogout} activeOpacity={0.7}>
              <View style={s.rowLeft}>
                <View style={[s.iconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="log-out-outline" size={20} color="#D97706" />
                </View>
                <Text style={s.rowLabel}>Log Out</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </TouchableOpacity>
            <View style={s.divider} />
            <TouchableOpacity style={s.row} activeOpacity={0.7} onPress={handleDeleteAccount}>
              <View style={s.rowLeft}>
                <View style={[s.iconBox, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="trash-outline" size={20} color="#DC2626" />
                </View>
                <Text style={[s.rowLabel, { color: '#DC2626' }]}>Delete Account</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function InfoRow({ icon, label, value, theme, s }) {
  return (
    <View style={s.row}>
      <View style={s.rowLeft}>
        <View style={[s.iconBox, { backgroundColor: theme.surfaceMuted }]}>
          <Ionicons name={icon} size={20} color={theme.textMuted} />
        </View>
        <View>
          <Text style={s.rowHint}>{label}</Text>
          <Text style={s.rowLabel}>{value}</Text>
        </View>
      </View>
    </View>
  );
}

const makeStyles = (theme, isDark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60, paddingTop: 12 },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 18,
    overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.07, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginLeft: 64,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 36, height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  rowHint: {
    fontSize: 12,
    color: theme.textMuted,
    marginBottom: 2,
  },
});