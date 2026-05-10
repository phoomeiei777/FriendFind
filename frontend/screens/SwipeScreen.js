import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  PanResponder,
  Platform,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import MatchOverlay from '../components/MatchOverlay';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SWIPE_OUT = SCREEN_W * 0.25;

export default function SwipeScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const {
    fetchUsersByActiveSubject,
    fetchUsersBySubject,
    fetchAllUsers,
    fetchSubjects,
    user: currentUser,
    recordSwipe,
    token,
  } = useApp();

  const [users, setUsers]             = useState([]);
  const [subjects, setSubjects]       = useState([]);
  const [selectedTab, setSelectedTab] = useState('Find');
  const [index, setIndex]             = useState(0);
  const [imageIndex, setImageIndex]   = useState(0);
  const [loading, setLoading]         = useState(false);
  const [showMatch, setShowMatch]     = useState(false);
  const [matchedUser, setMatchedUser] = useState(null);

  const position = useRef(new Animated.ValueXY()).current;
  const usersRef = useRef(users);
  const indexRef = useRef(index);

  const current = users[index];
  const s = makeStyles(theme, isDark);

  useEffect(() => {
    usersRef.current = users;
    indexRef.current = index;
  }, [users, index]);

  useEffect(() => {
    setImageIndex(0);
  }, [index]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSubjects();
        setSubjects(data.subjects || []);
      } catch {}
    };
    load();
  }, [fetchSubjects]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (selectedTab === 'Find') {
        response = await fetchAllUsers();
      } else {
        response = await (fetchUsersBySubject || fetchUsersByActiveSubject)(selectedTab);
      }
      setUsers(response.users || []);
      setIndex(0);
      position.setValue({ x: 0, y: 0 });
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTab, fetchAllUsers, fetchUsersBySubject, fetchUsersByActiveSubject, position]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const goNext = useCallback(() => {
    setIndex(prev => prev + 1);
    position.setValue({ x: 0, y: 0 });
  }, [position]);

  const forceSwipe = useCallback((direction) => {
    const x = direction === 'right' ? SCREEN_W * 1.5 : -SCREEN_W * 1.5;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(async () => {
      if (direction === 'right' && current) {
        if (token && currentUser?.id && current?.id) {
          try { await recordSwipe(current.id, 'right'); } catch {}
        }
        setMatchedUser(current);
        setShowMatch(true);
      } else {
        if (token && currentUser?.id && current?.id) {
          recordSwipe(current.id, 'left').catch(() => {});
        }
        goNext();
      }
    });
  }, [goNext, position, current, recordSwipe, token, currentUser]);

  const resetPosition = useCallback(() => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false,
    }).start();
  }, [position]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (evt, gesture) => {
        if (gesture.dx > SWIPE_OUT) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_OUT) {
          forceSwipe('left');
        } else {
          if (Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5) {
            const { locationX } = evt.nativeEvent;
            const item = usersRef.current[indexRef.current];
            if (item) {
              const imgs = item.images || [item.profile_image_url];
              if (locationX < (SCREEN_W - 40) / 2) {
                setImageIndex(prev => (prev > 0 ? prev - 1 : imgs.length - 1));
              } else {
                setImageIndex(prev => (prev < imgs.length - 1 ? prev + 1 : 0));
              }
            }
          }
          resetPosition();
        }
      },
    })
  ).current;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_W / 2, 0, SCREEN_W / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const cardAnimStyle = {
    transform: [...position.getTranslateTransform(), { rotate }],
  };

  const getImageSource = () => {
    if (current?.images?.[imageIndex]) return { uri: current.images[imageIndex] };
    if (current?.profile_image_url)    return { uri: current.profile_image_url };
    return require('../assets/image.png');
  };

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientEnd]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe} edges={['top']}>

        {/* Header */}
        <View style={s.header}>
          <Image source={require('../assets/image.png')} style={s.logo} resizeMode="contain" />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.tabsScrollContent}
            style={{ maxWidth: SCREEN_W - 160 }}
          >
            <TouchableOpacity onPress={() => setSelectedTab('Find')}>
              <Text style={[s.headerTab, selectedTab === 'Find' && s.headerTabActive]}>Find</Text>
            </TouchableOpacity>
            {subjects.map((sub, i) => (
              <TouchableOpacity key={i} onPress={() => setSelectedTab(sub.subject_code)}>
                <Text style={[s.headerTab, selectedTab === sub.subject_code && s.headerTabActive]}>
                  {sub.subject_code}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={s.bellBtn} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={22} color={theme.icon} />
            <View style={s.dot} />
          </TouchableOpacity>
        </View>

        {/* Card Stage */}
        <View style={s.stage}>
          {loading ? (
            <ActivityIndicator size="large" color="#FF4D67" />
          ) : !current ? (
            <View style={s.emptyState}>
              <MaterialCommunityIcons name="account-search-outline" size={80} color={theme.iconMuted} />
              <Text style={s.mutedText}>ไม่พบเพื่อนใหม่ในสาขานี้</Text>
            </View>
          ) : (
            <Animated.View style={[s.card, cardAnimStyle]} {...panResponder.panHandlers}>
              <ImageBackground source={getImageSource()} style={s.cardImage}>
                {current.images?.length > 1 && (
                  <View style={s.paginationRow}>
                    {current.images.map((_, i) => (
                      <View
                        key={i}
                        style={[
                          s.paginationBar,
                          { backgroundColor: i === imageIndex ? '#FFF' : 'rgba(255,255,255,0.4)' },
                        ]}
                      />
                    ))}
                  </View>
                )}
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={s.cardGradient}>
                  <View style={s.profileDetails}>
                    <Text style={s.profileName}>
                      {current.name || current.username},{' '}
                      <Text style={s.profileAge}>{current.year || '?'}</Text>
                    </Text>
                    <View style={s.facultyBadge}>
                      <Text style={s.facultyText}>{current.faculty || 'ไม่ระบุคณะ'}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </Animated.View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={s.footer}>
          <TouchableOpacity style={s.circleBtn} onPress={() => forceSwipe('left')}>
            <MaterialCommunityIcons name="close" size={32} color="#F43F5E" />
          </TouchableOpacity>
          <TouchableOpacity style={s.starBtn}>
            <MaterialCommunityIcons name="star" size={26} color="#3B82F6" />
          </TouchableOpacity>
          <TouchableOpacity style={s.circleBtn} onPress={() => forceSwipe('right')}>
            <MaterialCommunityIcons name="heart" size={32} color="#10B981" />
          </TouchableOpacity>
        </View>

        <MatchOverlay
          visible={showMatch}
          currentUser={currentUser}
          matchedUser={matchedUser}
          selectedSubject={selectedTab}
          onClose={() => { setShowMatch(false); goNext(); }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const makeStyles = (theme, isDark) => StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logo: { width: 60, height: 60 },
  tabsScrollContent: { alignItems: 'center', gap: 20, paddingHorizontal: 10 },
  headerTab: { fontSize: 22, fontWeight: '700', color: theme.iconMuted },
  headerTabActive: {
    color: theme.text,
    borderBottomWidth: 3,
    borderBottomColor: '#FF4D67',
    paddingBottom: 2,
  },
  bellBtn: {
    padding: 8,
    backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : '#FFF',
    borderRadius: 14,
    borderWidth: isDark ? 1 : 0,
    borderColor: 'rgba(255,255,255,0.2)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  dot: {
    position: 'absolute',
    top: 7, right: 7,
    width: 12, height: 12,
    borderRadius: 50,
    backgroundColor: '#F43F5E',
    borderWidth: 1.5,
    borderColor: isDark ? '#1A1A2E' : '#FFF',
  },
  stage: { flex: 1, paddingHorizontal: 16, paddingTop: 60, justifyContent: 'center' },
  card: {
    height: SCREEN_H * 0.70,
    width: '100%',
    borderRadius: 32,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#FFF',
    borderWidth: isDark ? 1 : 0,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 15 }, shadowOpacity: isDark ? 0.5 : 0.1, shadowRadius: 25 },
      android: { elevation: 10 },
    }),
  },
  cardImage: { flex: 1, justifyContent: 'flex-end' },
  cardGradient: { padding: 24, paddingTop: 80, paddingBottom: 50 },
  paginationRow: {
    position: 'absolute',
    top: 20, left: 20, right: 20,
    flexDirection: 'row',
    gap: 3,
    zIndex: 10,
  },
  paginationBar: { flex: 1, height: 3, borderRadius: 2 },
  profileDetails: {},
  profileName: { color: '#FFF', fontSize: 28, fontWeight: '800' },
  profileAge:  { fontWeight: '400', fontSize: 24 },
  facultyBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  facultyText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  circleBtn: {
    width: 64, height: 64,
    borderRadius: 32,
    backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: isDark ? 1 : 0,
    borderColor: 'rgba(255,255,255,0.2)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: isDark ? 0.4 : 0.1, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  starBtn: {
    width: 54, height: 54,
    borderRadius: 27,
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: isDark ? 1 : 0,
    borderColor: 'rgba(255,255,255,0.15)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  emptyState: { alignItems: 'center', gap: 12 },
  mutedText:  { textAlign: 'center', color: '#9CA3AF', fontSize: 16 },
});
