import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function CustomButton({ title, onPress, style, textStyle, activeOpacity = 0.8 }) {
  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={onPress} 
      activeOpacity={activeOpacity}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { 
    backgroundColor: '#000', 
    height: 56, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 24 
  },
  text: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: '600' 
  },
});
