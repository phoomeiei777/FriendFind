import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import CustomButton from '../components/CustomButton';

export default function ResetPasswordScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = React.useRef([]);
  const [newPassword, setNewPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { resetPassword, requestOTP, verifyOTP } = useApp();

  const handleContinue = async () => {
    if (step === 1) {
      if (!phone || phone.length < 10) {
        Alert.alert("Error", "Please enter a valid phone number");
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
      } catch (error) {
        Alert.alert("Error", error.message || "Failed to send OTP");
      } finally {
        setIsProcessing(false);
      }
    } else if (step === 2) {
      const enteredOtp = otp.join('');
      if (enteredOtp.length < 6) {
        Alert.alert("Error", "Please enter a valid 6-digit code");
        return;
      }
      setIsProcessing(true);
      try {
        await verifyOTP(phone, enteredOtp);
        setStep(3);
      } catch (error) {
        Alert.alert("Error", "Invalid OTP code");
      } finally {
        setIsProcessing(false);
      }
    } else if (step === 3) {
      if (!newPassword || newPassword.length < 6) {
        if (Platform.OS === 'web') {
          window.alert("ข้อผิดพลาด\nPassword must be at least 6 characters.");
        } else {
          Alert.alert("ข้อผิดพลาด", "Password must be at least 6 characters.");
        }
        return;
      }
      try {
        const identity = phone;
        await resetPassword(identity, newPassword);

        if (Platform.OS === 'web') {
          window.alert("สำเร็จ\nรหัสผ่านของคุณถูกตั้งใหม่แล้ว!");
        } else {
          Alert.alert("สำเร็จ", "รหัสผ่านของคุณถูกตั้งใหม่แล้ว!");
        }
        navigation.replace('Login');
      } catch (error) {
        const msg = error.message || "Failed to reset password. Please try again.";
        if (Platform.OS === 'web') {
          window.alert(`Error\n${msg}`);
        } else {
          Alert.alert("Error", msg);
        }
      }
    }
  };

  const getTitle = () => {
    if (step === 1) return "Reset Your Password";
    if (step === 2) return "ENTER YOUR CONFIRMATION CODE";
    return "Create New Password";
  };

  const getSubtitle = () => {
    if (step === 1) return "Enter your phone number to receive an OTP";
    if (step === 2) return `Sent to: ${phone}`;
    return "Please enter a strong password";
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'bottom', 'left']}>
      <Header showBack={true} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <Image
            source={require('../assets/image.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Text Section */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{getTitle()}</Text>
            <Text style={styles.subtitle}>{getSubtitle()}</Text>
          </View>

          {/* Input Section */}
          <View style={styles.inputAreaWrapper}>
            {step === 1 && (
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#6B7280" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone number (e.g. 0812345678)"
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
                    style={styles.otpInputSmall}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={text => {
                      const newOtp = [...otp];
                      newOtp[index] = text;
                      setOtp(newOtp);
                      if (text && index < 5) {
                        otpRefs.current[index + 1].focus();
                      } else if (!text && index > 0) {
                        otpRefs.current[index - 1].focus();
                      }
                    }}
                  />
                ))}
              </View>
            )}

            {step === 3 && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="New Password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={true}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  autoFocus={true}
                />
              </View>
            )}


          </View>

          {/* Action Buttons */}
          <CustomButton
            title={step === 1 ? 'Send OTP' : (step === 2 ? 'Verify OTP' : 'Update Password')}
            onPress={handleContinue}
            loading={isProcessing}
          />

          {/* Footer Terms */}
          <View style={{ flex: 1, minHeight: 40 }} />
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Remember your password?{" "}
              <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>Login here</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFEAF2'
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20
  },
  logo: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    marginBottom: 20
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
    textAlign: 'center'
  },
  inputAreaWrapper: {
    zIndex: 9999,
    position: 'relative',
    marginBottom: 16,
  },
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
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  otpWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingHorizontal: 0,
    marginBottom: 20,
  },
  otpInputSmall: {
    width: 45,
    height: 55,
    backgroundColor: '#FFF',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  footerContainer: {
    marginTop: 'auto',
    paddingBottom: 10
  },
  footerText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 18
  },
  linkText: {
    color: '#111827',
    fontWeight: '600'
  },
});
