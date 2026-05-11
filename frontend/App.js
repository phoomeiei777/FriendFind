import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './context/AppContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import AppNavigator from './navigation/AppNavigator';
import { View, StyleSheet, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const FakeDynamicIsland = () => (
  <View pointerEvents="none" style={styles.dynamicIslandWrapper}>
    <View style={styles.dynamicIsland} />
  </View>
);

function AppWrapper() {
  const { isDark } = useTheme();
  return (
    <>
      <AppNavigator />
      <FakeDynamicIsland />
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
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  dynamicIsland: {
    width: 125,
    height: 37,
    backgroundColor: '#000000',
    borderRadius: 20,
  }
});
