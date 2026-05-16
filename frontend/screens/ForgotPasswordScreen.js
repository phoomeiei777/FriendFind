import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import CustomButton from '../components/CustomButton';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const { requestOTP, verifyOTP, resetPassword } = useApp();

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    setIsProcessing(true);
    try {
      let formattedPhone = phone;
      if (phone.startsWith('0')) {
        formattedPhone = '+66' + phone.substring(1);
      } else if (!phone.startsWith('+')) {
        formattedPhone = '+66' + phone;
      }
      await requestOTP(formattedPhone);
      setPhone(formattedPhone);
      setStep(2);
      setTimeLeft(60);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOTP = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }
    setIsProcessing(true);
    try {
      // We don't use the result to login, just to verify they own the number
      const result = await verifyOTP(phone, enteredOtp);
      // If it's a new user, they can't reset password
      if (result.isNewUser) {
        Alert.alert('Error', 'Account not found for this phone number.');
        setStep(1);
      } else {
        setStep(3);
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid code.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setIsProcessing(true);
    try {
      await resetPassword(phone, newPassword);
      Alert.alert('Success', 'Your password has been reset successfully.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to reset password');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      otpRefs.current[index + 1].focus();
    } else if (!text && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
      <Header showBack={true} title="Reset Password" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} bounces={false}>
          <Image source={require('../assets/image.png')} style={styles.logo} resizeMode="contain" />

          <View style={styles.textContainer}>
            <Text style={styles.title}>
              {step === 1 ? 'Find Your Account' : step === 2 ? 'Verify Your Phone' : 'Set New Password'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1 ? 'Enter your phone number to receive a reset code' : 
               step === 2 ? `Enter the 6-digit code sent to ${phone}` : 
               'Choose a strong password for your account'}
            </Text>
          </View>

          {step === 1 && (
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#6B7280" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="081 234 5678"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                autoFocus={true}
              />
            </View>
          )}

          {step === 2 && (
            <View style={styles.otpWrapper}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={el => otpRefs.current[index] = el}
                  style={styles.otpInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={text => handleOtpChange(text, index)}
                  autoFocus={index === 0}
                />
              ))}
            </View>
          )}

          {step === 3 && (
            <View style={{ width: '100%' }}>
              <View style={[styles.inputContainer, { marginBottom: 16 }]}>
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  autoFocus={true}
                />
              </View>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm New Password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>
          )}

          <View style={{ marginTop: 24 }}>
            <CustomButton 
              title={step === 1 ? "Send Code" : step === 2 ? "Verify Code" : "Reset Password"} 
              onPress={step === 1 ? handleSendOTP : step === 2 ? handleVerifyOTP : handleResetPassword}
              loading={isProcessing}
            />
          </View>

          {step === 2 && timeLeft > 0 && (
            <Text style={styles.resendText}>Resend code in {timeLeft}s</Text>
          )}
          {step === 2 && timeLeft === 0 && (
            <TouchableOpacity onPress={handleSendOTP}>
              <Text style={[styles.resendText, { color: '#F58882', fontWeight: 'bold' }]}>Resend Code</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFEAF2' },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 10, paddingBottom: 20 },
  logo: { width: 120, height: 120, alignSelf: 'center', marginBottom: 20 },
  textContainer: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 18, fontWeight: '700', color: '#4B5563', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 56,
    paddingHorizontal: 16,
  },
  input: { flex: 1, fontSize: 16, color: '#111827', height: '100%' },
  otpWrapper: { flexDirection: 'row', justifyContent: 'center', gap: 8, width: '100%' },
  otpInput: {
    width: 42, height: 52, backgroundColor: '#FFF', borderRadius: 10,
    fontSize: 20, fontWeight: '800', textAlign: 'center',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  resendText: { textAlign: 'center', color: '#9CA3AF', fontSize: 14, marginTop: 16 },
});
