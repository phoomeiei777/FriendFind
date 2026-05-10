import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

export default function Header({ 
  title, 
  subTitle,
  showBack = true, 
  onBackPress, 
  leftComponent,
  rightComponent,
  centerComponent,
  backgroundColor = 'transparent'
}) {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const s = makeStyles(theme, isDark);

  return (
    <View style={[s.headerWrapper, { backgroundColor }]}>
      <SafeAreaView edges={['top']} style={s.safeArea}>
        <View style={s.headerContent}>
          
          <View style={s.leftSection}>
            {leftComponent ? (
              leftComponent
            ) : showBack ? (
              <TouchableOpacity 
                onPress={handleBack} 
                style={s.backButton}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <Ionicons name="chevron-back" size={28} color={theme.text} />
              </TouchableOpacity>
            ) : (
               <View style={s.iconPlaceholder} />
            )}
          </View>

          <View style={s.centerSection}>
            {centerComponent ? (
              centerComponent
            ) : (
              <View style={s.titleContainer}>
                {title && <Text style={s.mainTitle} numberOfLines={1}>{title}</Text>}
                {subTitle && <Text style={s.subTitle} numberOfLines={1}>{subTitle}</Text>}
              </View>
            )}
          </View>

          <View style={s.rightSection}>
            {rightComponent || <View style={s.iconPlaceholder} />}
          </View>

        </View>
      </SafeAreaView>
    </View>
  );
}

const makeStyles = (theme, isDark) => StyleSheet.create({
  headerWrapper: {
    zIndex: 10,
  },
  safeArea: {},
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    height: 50,
  },
  leftSection: {
    minWidth: 40,
    justifyContent: 'center',
  },
  centerSection: {
    flex: 1,
    paddingLeft: 8,
    justifyContent: 'center',
  },
  titleContainer: {
    justifyContent: 'center',
  },
  rightSection: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  backButton: {
    marginLeft: -4,
  },
  iconPlaceholder: {
    width: 28,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.text,
    lineHeight: 22,
  },
  subTitle: {
    fontSize: 11,
    color: theme.textMuted,
    marginTop: -2,
  },
});