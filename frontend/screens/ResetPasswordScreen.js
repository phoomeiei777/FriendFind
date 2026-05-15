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
import OtpInputRow from '../components/OtpInputRow';
import { sendOtp } from '../utils/otpUtils';

export default function ResetPasswordScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [actualOtp, setActualOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+66');
  const [showCountryCodePicker, setShowCountryCodePicker] = useState(false);
  const COUNTRY_CODES = ['+66', '+1', '+81', '+44', '+91'];
  
  const { resetPassword } = useApp();

  const handleContinue = async () => {
    if (step === 1) {
      if (!phoneNumber || phoneNumber.length < 9) {
        if (Platform.OS === 'web') {
          window.alert("ข้อผิดพลาด\nPlease enter a valid phone number");
        } else {
          Alert.alert("ข้อผิดพลาด", "Please enter a valid phone number");
        }
        return;
      }
      const response = await sendOtp(`${countryCode}${phoneNumber}`);
      if (response.success) {
        setActualOtp(response.otp);
        if (Platform.OS === 'web') {
          window.alert(`รหัส OTP จำลอง\nรหัส OTP ของคุณคือ: ${response.otp}`);
        } else {
          Alert.alert("รหัส OTP จำลอง", `รหัส OTP ของคุณคือ: ${response.otp}`);
        }
        setStep(2);
      }
    } else if (step === 2) {
      const enteredOtp = otp.join('');
      if (enteredOtp !== actualOtp) {
        if (Platform.OS === 'web') {
          window.alert("ข้อผิดพลาด\nInvalid OTP");
        } else {
          Alert.alert("ข้อผิดพลาด", "Invalid OTP");
        }
        return;
      }
      setStep(3);
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
        const identity = phoneNumber;
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
    if (step === 2) return `Sent to: ${countryCode} ${phoneNumber}`;
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
                <TouchableOpacity 
                  style={styles.countryCodeButton} 
                  onPress={() => setShowCountryCodePicker(!showCountryCodePicker)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.countryCodeText}>{String(countryCode)}</Text>
                  <Ionicons 
                    name={showCountryCodePicker ? "chevron-up" : "chevron-down"} 
                    size={14} 
                    color="#6B7280" 
                    style={{ marginLeft: 4 }} 
                  />
                </TouchableOpacity>
                
                <View style={styles.dividerVertical} />
                
                <TextInput
                  style={styles.input}
                  placeholder="Phone number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  autoFocus={true}
                  maxLength={10}
                />
              </View>
            )}

            {step === 2 && (
              <OtpInputRow 
                otp={otp} 
                onChangeText={(text, index) => {
                  const newOtp = [...otp];
                  newOtp[index] = text;
                  setOtp(newOtp);
                }} 
              />
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

            {/* Inline Relative Dropdown */}
            {step === 1 && showCountryCodePicker && (
              <View style={styles.inlineCountryDropdown}>
                {COUNTRY_CODES.map((code, index) => {
                  const isSelected = countryCode === code;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.inlineDropdownItem, 
                        isSelected && styles.inlineDropdownItemSelected
                      ]}
                      onPress={() => {
                        setCountryCode(code);
                        setShowCountryCodePicker(false);
                      }}
                    >
                      <Text style={[
                        styles.inlineDropdownText, 
                        isSelected && styles.inlineDropdownTextSelected
                      ]}>
                        {String(code)}
                      </Text>
                      {isSelected ? (
                        <Ionicons name="checkmark-circle" size={16} color="#F58882" />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <CustomButton 
            title={step === 1 ? 'Send OTP' : (step === 2 ? 'Verify OTP' : 'Update Password')} 
            onPress={handleContinue} 
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
  countryCodeButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    height: '100%' 
  },
  countryCodeText: { 
    fontSize: 16, 
    color: '#111827', 
    fontWeight: '600' 
  },
  dividerVertical: { 
    width: 1, 
    height: 24, 
    backgroundColor: '#D1D5DB', 
    marginHorizontal: 12 
  },
  input: { 
    flex: 1, 
    fontSize: 16, 
    color: '#111827', 
    height: '100%' 
  },
  inlineCountryDropdown: {
    position: 'absolute',
    top: 60, 
    left: 0,
    width: 140, 
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 10000, 
  },
  inlineDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  inlineDropdownItemSelected: { 
    backgroundColor: '#FFF5F7' 
  },
  inlineDropdownText: { 
    fontSize: 16, 
    color: '#4B5563' 
  },
  inlineDropdownTextSelected: { 
    color: '#F58882', 
    fontWeight: '700' 
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
