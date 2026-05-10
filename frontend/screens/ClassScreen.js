import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function ClassScreen() {
  const { setActiveSubject, fetchSubjects } = useApp();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();

  const [subjects, setSubjects]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await fetchSubjects();
      setSubjects(data.subjects || []);
    } catch (e) {
      console.warn(e);
      setSubjects([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchSubjects]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleSelectSubject = (item) => {
    setActiveSubject(item);
    navigation.navigate('GroupClass');
  };

  const filteredSubjects = subjects.filter(sub =>
    sub.subject_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.subject_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const s = makeStyles(theme, isDark);

  const renderItem = ({ item, index }) => {
    const isHot = index < 2;
    return (
      <TouchableOpacity style={s.card} onPress={() => handleSelectSubject(item)} activeOpacity={0.85}>
        {isHot && (
          <View style={s.hotBadge}>
            <Text style={s.hotBadgeText}>HOT</Text>
          </View>
        )}
        <Text style={s.code}>{item.subject_code}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe} edges={['top']}>

        {/* Header */}
        <View style={s.header}>
          <Image source={require('../assets/image.png')} style={{ width: 60, height: 60 }} resizeMode="contain" />
          <Text style={s.headerTitle}>Class</Text>
          <TouchableOpacity style={s.bellBtn} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={22} color={theme.icon} />
            <View style={s.dot} />
          </TouchableOpacity>
        </View>

        <Text style={s.welcomeText}>Welcome to class...</Text>

        {/* Search */}
        <View style={s.searchContainer}>
          <Ionicons name="search" size={20} color={theme.textMuted} style={{ marginRight: 10 }} />
          <TextInput
            style={s.searchInput}
            placeholder="Search"
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Grid */}
        {loading ? (
          <ActivityIndicator size="large" color={theme.button} style={{ marginTop: 24 }} />
        ) : (
          <FlatList
            data={filteredSubjects}
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
            numColumns={2}
            contentContainerStyle={s.list}
            columnWrapperStyle={s.row}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.button} />}
            ListEmptyComponent={<Text style={s.empty}>No classes found.</Text>}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const makeStyles = (theme, isDark) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: theme.text },
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
  welcomeText: { fontSize: 22, fontWeight: '600', color: theme.textMuted, paddingHorizontal: 20, marginTop: 10 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceMuted,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 15,
    height: 40,
  },
  searchInput: { flex: 1, fontSize: 16, color: theme.text },
  list: { paddingHorizontal: 15, paddingTop: 20, paddingBottom: 32 },
  row:  { justifyContent: 'space-between' },
  card: {
    width: (width - 50) / 2,
    height: 220,
    backgroundColor: isDark ? '#4B0082' : '#4B0082',
    borderRadius: 16,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.5 : 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  hotBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#FF0000', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  hotBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  code:  { fontSize: 24, fontWeight: '800', color: '#FFF' },
  empty: { textAlign: 'center', color: theme.textMuted, padding: 24 },
});