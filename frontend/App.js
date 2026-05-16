import React, { useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import AppNavigator from './navigation/AppNavigator';
import { View, StyleSheet, Platform, Animated, Text, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

function DynamicIslandToast() {
  const { toastMessage, setToastMessage } = useApp();
  const islandWidth = useRef(new Animated.Value(125)).current;
  const islandHeight = useRef(new Animated.Value(37)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toastMessage) {
      // Show and expand
      Animated.sequence([
        Animated.spring(scale, { toValue: 1, useNativeDriver: false }),
        Animated.parallel([
          Animated.spring(islandWidth, { toValue: width - 32, useNativeDriver: false, friction: 8 }),
          Animated.spring(islandHeight, { toValue: 80, useNativeDriver: false, friction: 8 }),
          Animated.timing(contentOpacity, { toValue: 1, duration: 200, delay: 100, useNativeDriver: false }),
        ])
      ]).start();

      const timer = setTimeout(() => {
        // Shrink and hide
        Animated.parallel([
          Animated.timing(contentOpacity, { toValue: 0, duration: 150, useNativeDriver: false }),
          Animated.spring(islandWidth, { toValue: 125, useNativeDriver: false, friction: 9 }),
          Animated.spring(islandHeight, { toValue: 37, useNativeDriver: false, friction: 9 }),
        ]).start(() => {
          Animated.spring(scale, { toValue: 0, useNativeDriver: false }).start(() => {
            setToastMessage('');
          });
        });
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (!toastMessage) return null;

  return (
    <Animated.View 
      style={[
        styles.dynamicIslandWrapper, 
        { 
          transform: [{ scale }]
        }
      ]}
    >
      <Animated.View 
        style={{ 
          width: islandWidth, 
          height: islandHeight,
          backgroundColor: '#000000',
          borderRadius: 24,
          flexDirection: 'row',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Animated.View style={[styles.toastContent, { opacity: contentOpacity }]}>
          <View style={styles.toastIcon}>
            <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" />
          </View>
          <View style={styles.toastTextContainer}>
            <Text style={styles.toastTitle}>Notification</Text>
            <Text style={styles.toastMessage} numberOfLines={2}>{toastMessage}</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

function AppWrapper() {
  const { isDark } = useTheme();

  return (
    <>
      <AppNavigator />
      <DynamicIslandToast />
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppProvider>
            <AppWrapper />
          </AppProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  dynamicIslandWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 12 : 15,
    alignSelf: 'center',
    backgroundColor: '#000000',
    borderRadius: 24,
    zIndex: 9999,
    elevation: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    width: '100%',
  },
  toastIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  toastTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  toastTitle: {
    color: '#999',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toastMessage: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 1,
  }
});
