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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import StatusBadge from '../components/StatusBadge';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function ClassScreen() {
  const { setActiveSubject, fetchSubjects, fetchMyEnrollments, enrollSubject } = useApp();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();

  const [subjects, setSubjects]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const load = useCallback(async () => {
    try {
      const [subjectsData, enrollmentsData] = await Promise.all([
        fetchSubjects(),
        fetchMyEnrollments()
      ]);
      const allSubjects = subjectsData.subjects || [];
      const myEnrollments = enrollmentsData.enrollments || [];
      
      const combined = allSubjects.map(sub => {
        const enrollment = myEnrollments.find(e => e.subject_id === sub.id);
        return {
          ...sub,
          enrollmentStatus: enrollment ? enrollment.status : null
        };
      });
      setSubjects(combined);
    } catch (e) {
      console.warn(e);
      setSubjects([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchSubjects, fetchMyEnrollments]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleSelectSubject = (item) => {
    if (item.enrollmentStatus === 'approved') {
      setActiveSubject(item);
      navigation.navigate('GroupClass');
    } else if (item.enrollmentStatus === 'pending') {
      alert("คำขอเข้าร่วมวิชานี้กำลังรอการอนุมัติจากแอดมิน");
    } else {
      // Not enrolled, prompt to enroll
      Alert.alert(
        "เข้าร่วมรายวิชา",
        `คุณต้องการส่งคำขอเข้าร่วมวิชา ${item.subject_code} ใช่หรือไม่?`,
        [
          { text: "ยกเลิก", style: "cancel" },
          {
            text: "ยืนยัน",
            onPress: async () => {
              try {
                await enrollSubject(item.id);
                load(); // Reload data to update status
              } catch (e) {
                alert("ไม่สามารถส่งคำขอได้ อาจส่งไปแล้ว");
              }
            }
          }
        ]
      );
    }
  };

  const filteredSubjects = subjects.filter(sub =>
    sub.subject_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.subject_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const s = makeStyles(theme, isDark);

  const renderItem = ({ item }) => {
    let badgeText = ' ขอเข้าร่วม';
    let statusProp = 'info';
    
    if (item.enrollmentStatus === 'approved') {
      badgeText = ' เข้ากลุ่มแล้ว';
      statusProp = 'approved';
    } else if (item.enrollmentStatus === 'pending') {
      badgeText = ' รออนุมัติ';
      statusProp = 'pending';
    }

    return (
      <TouchableOpacity 
        style={s.card} 
        onPress={() => handleSelectSubject(item)} 
        activeOpacity={0.8}
      >
        <View style={s.badgeWrapper}>
          <StatusBadge status={statusProp} text={badgeText} />
        </View>
        
        <View style={s.cardInfo}>
          <Text style={s.code}>{item.subject_code}</Text>
          <Text style={s.name} numberOfLines={2}>{item.subject_name}</Text>
        </View>

        <View style={s.cardFooter}>
          <Text style={s.tapToEnter}>
            {item.enrollmentStatus === 'approved' ? 'เข้าสู่ห้องเรียน' : 'แตะเพื่อขอเข้าร่วม'}
          </Text>
          
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe} edges={['top']}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Image source={require('../assets/image.png')} style={s.logo} resizeMode="contain" />
            <Text style={s.headerTitle}>Class</Text>
          </View>
          <TouchableOpacity style={s.bellBtn} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications" size={24} color={theme.accent} />
            <View style={s.dot} />
          </TouchableOpacity>
        </View>

        <View style={s.subHeader}>
          <Text style={s.welcomeText}>Welcome to class</Text>
          <Text style={s.subWelcomeText}>Find your study partners today.</Text>
        </View>

        {/* Search */}
        <View style={s.searchContainer}>
          <Ionicons name="search" size={20} color={theme.textMuted} style={{ marginRight: 10 }} />
          <TextInput
            style={s.searchInput}
            placeholder="Search by code or name..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Grid */}
        {loading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={theme.button} />
          </View>
        ) : (
          <FlatList
            data={filteredSubjects}
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
            numColumns={2}
            contentContainerStyle={s.list}
            columnWrapperStyle={s.row}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.button} />}
            ListEmptyComponent={<Text style={s.empty}>No classes found.</Text>}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const makeStyles = (theme, isDark) => StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 45,
    height: 45,
    marginRight: 12,
  },
  headerTitle: { 
    fontSize: 32, 
    fontWeight: '900', 
    color: theme.text,
    letterSpacing: -0.5,
  },
  bellBtn: {
    padding: 10,
    backgroundColor: theme.surface,
    borderRadius: 16,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  dot: {
    position: 'absolute',
    top: 10, right: 10,
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: '#F43F5E',
    borderWidth: 2,
    borderColor: theme.surface,
  },
  
  subHeader: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 5,
  },
  welcomeText: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: theme.text,
  },
  subWelcomeText: {
    fontSize: 15,
    color: theme.textMuted,
    fontWeight: '500',
    marginTop: 2,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 15,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 16, color: theme.text, fontWeight: '500' },
  
  list: { paddingHorizontal: 15, paddingTop: 20, paddingBottom: 100 },
  row:  { justifyContent: 'space-between' },
  
  card: {
    width: (width - 45) / 2,
    height: 190,
    backgroundColor: '#6366F1', // Indigo Brand Color
    borderRadius: 28,
    marginBottom: 15,
    padding: 18,
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 10 },
    }),
  },
  badgeWrapper: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardInfo: {
    marginTop: 5,
  },
  code: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  tapToEnter: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
  },
  empty: { 
    textAlign: 'center', 
    color: theme.textMuted, 
    fontSize: 16,
    fontWeight: '500',
    marginTop: 50 
  },
});