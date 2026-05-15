import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import SwipeScreen from '../screens/SwipeScreen';
import GroupDiscoveryScreen from '../screens/GroupDiscoveryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ClassScreen from '../screens/ClassScreen';
import LoaderScreen from '../screens/LoaderScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SettingScreen from '../screens/SettingScreen';
import GroupClassScreen from '../screens/GroupClassScreen';
import GroupJoinScreen from '../screens/GroupJoinScreen';
import GroupAddMemberScreen from '../screens/GroupAddMemberScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import NotificationScreen from '../screens/NotificationScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const SubjectStack = createNativeStackNavigator();
const GroupsStack  = createNativeStackNavigator();

function SubjectStackScreen() {
  return (
    <SubjectStack.Navigator screenOptions={{ headerShown: false }}>
      <SubjectStack.Screen name="Class"           component={ClassScreen} />
      <SubjectStack.Screen name="GroupClass"      component={GroupClassScreen} />
      <SubjectStack.Screen name="GroupJoin"       component={GroupJoinScreen} />
      <SubjectStack.Screen name="GroupAddMember"  component={GroupAddMemberScreen} />
    </SubjectStack.Navigator>
  );
}

function GroupsStackScreen() {
  return (
    <GroupsStack.Navigator screenOptions={{ headerShown: false }}>
      <GroupsStack.Screen name="GroupDiscovery" component={GroupDiscoveryScreen} />
    </GroupsStack.Navigator>
  );
}

function MainTabs() {
  const { theme, isDark } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   theme.button,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor:  theme.border,
        },
        tabBarIcon: ({ color, size }) => {
          const map = {
            Swipe:   'heart-outline',
            Groups:  'people-outline',
            Profile: 'person-outline',
            Subject: 'book-outline',
          };
          return <Ionicons name={map[route.name] || 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Swipe"   component={SwipeScreen} />
      <Tab.Screen name="Groups"  component={GroupsStackScreen} options={{ title: 'Discovery' }} />
      <Tab.Screen name="Subject" component={SubjectStackScreen} options={{ title: 'Class' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { isDark, theme } = useTheme();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.background,
      card:       theme.card,
      text:       theme.text,
      border:     theme.border,
      primary:    theme.button,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Loader"        component={LoaderScreen} />
        <Stack.Screen name="Login"         component={LoginScreen} />
        <Stack.Screen name="Register"      component={RegisterScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="EditProfile"   component={EditProfileScreen} />
        <Stack.Screen name="Setting"       component={SettingScreen} />
        <Stack.Screen name="ChatDetail"    component={ChatDetailScreen} />
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="MainTabs"      component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function AppNavigator() {
  return (
    <AppContent />
  );
}