import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Dimensions, TouchableOpacity, Easing, Platform } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function MatchOverlay({ visible, currentUser, matchedUser, selectedSubject, onClose }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const logoLeftAnim = useRef(new Animated.Value(-100)).current;
  const logoRightAnim = useRef(new Animated.Value(width)).current;
  const navigation = useNavigation();

  const handleSendMessage = () => {
    onClose();
    navigation.navigate('ChatDetail', {
      chatType: 'private',
      title: matchedUser?.name || matchedUser?.username || 'Study Buddy',
      subTitle: selectedSubject === 'Find' ? 'Study Buddy' : selectedSubject,
      members: [],
      target_user_id: matchedUser?.id,
    });
  };

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true })
        ]),
        Animated.parallel([
          Animated.spring(logoLeftAnim, { toValue: 0, friction: 6, tension: 50, useNativeDriver: true }),
          Animated.spring(logoRightAnim, { toValue: 0, friction: 6, tension: 50, useNativeDriver: true })
        ])
      ]).start();
    } else {
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      scaleAnim.setValue(0.5);
      logoLeftAnim.setValue(-100);
      logoRightAnim.setValue(width);
    }
  }, [visible]);

  if (!visible) return null;

  const currentImage = currentUser?.profile_image_url ? { uri: currentUser.profile_image_url } : require('../assets/image.png');
  const matchedImage = matchedUser?.profile_image_url ? { uri: matchedUser.profile_image_url } : require('../assets/image.png');

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.85)' }]} />
      <LinearGradient colors={['rgba(255,100,150,0.4)', 'rgba(255,20,100,0.8)']} style={StyleSheet.absoluteFillObject} />

      <Animated.Text style={[styles.matchText, { transform: [{ scale: scaleAnim }] }]}>
        FINDER
      </Animated.Text>

      <View style={styles.avatarsContainer}>
        <Animated.View style={[styles.avatarWrapper, styles.leftAvatar, { transform: [{ translateX: logoLeftAnim }] }]}>
          <Image source={currentImage} style={styles.avatarImage} />
        </Animated.View>

        <Animated.View style={[styles.avatarWrapper, styles.rightAvatar, { transform: [{ translateX: logoRightAnim }] }]}>
          <Image source={matchedImage} style={styles.avatarImage} />
        </Animated.View>
      </View>

      <Text style={styles.subtitle}>You found your study buddy!</Text>

      <View style={styles.chatInputContainer}>
        <Text style={styles.chatPlaceholder}>Message...</Text>
        <TouchableOpacity style={styles.sendBtn} onPress={handleSendMessage}>
          <Ionicons name="send" size={20} color="#FF4D67" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onClose} style={styles.keepSwipingBtn}>
        <Text style={styles.keepSwipingText}>Keep Swiping</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    padding: 20,
  },
  matchText: {
    fontSize: 55,
    fontWeight: '900',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
    marginBottom: 60,
    letterSpacing: 2,
    fontStyle: 'italic',
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
    height: 160,
  },
  avatarWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#FFF',
    overflow: 'hidden',
    position: 'absolute',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 10 }, android: { elevation: 15 } })
  },
  leftAvatar: {
    left: -100,
    zIndex: 2,
  },
  rightAvatar: {
    right: -100,
    zIndex: 1,
    top: 20,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 20,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    width: '100%',
    maxWidth: 320,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 20,
  },
  chatPlaceholder: {
    flex: 1,
    color: '#9CA3AF',
    fontSize: 16,
  },
  sendBtn: {
    padding: 4,
  },
  keepSwipingBtn: {
    marginTop: 10,
  },
  keepSwipingText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  }
});
