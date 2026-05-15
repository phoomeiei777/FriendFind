import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SocialButton({ iconName, iconColor, title, onPress, style }) {
  return (
    <TouchableOpacity style={[styles.button, style]} activeOpacity={0.7} onPress={onPress}>
      <Ionicons name={iconName} size={20} color={iconColor} style={styles.icon} />
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E5E7EB',
    height: 56, 
    borderRadius: 12, 
    marginBottom: 12,
  },
  icon: { 
    marginRight: 10 
  },
  text: { 
    color: '#111827', 
    fontSize: 15, 
    fontWeight: '600' 
  },
});
