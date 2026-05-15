import React, { useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

export default function OtpInputRow({ otp, onChangeText }) {
  const otpRefs = useRef([]);
  
  const handleChange = (text, index) => {
    onChangeText(text, index);
    if (text && index < 3) {
      otpRefs.current[index + 1].focus();
    } else if (!text && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.otpWrapper}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => (otpRefs.current[index] = ref)}
          style={styles.otpInput}
          keyboardType="number-pad"
          maxLength={1}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  otpWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 0,
  },
  otpInput: {
    width: 75,
    height: 75,
    backgroundColor: '#FFF',
    borderRadius: 16,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});
