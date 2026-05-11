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
import { sendOtp } from '../utils/otpUtils';

export default function LoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [actualOtp, setActualOtp] = useState('');
  const [countryCode, setCountryCode] = useState('+66');
  const [showCountryCodePicker, setShowCountryCodePicker] = useState(false);
  const COUNTRY_CODES = ['+66', '+1', '+81', '+44', '+91'];
  
  const { login } = useApp();
  const otpRefs = React.useRef([]); // ✅ เพิ่ม Ref สำหรับ Auto-focus

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 3) {
      otpRefs.current[index + 1].focus();
    } else if (!text && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

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
    } else {
      const enteredOtp = otp.join('');
      if (enteredOtp !== actualOtp) {
        if (Platform.OS === 'web') {
          window.alert("ข้อผิดพลาด\nInvalid OTP");
        } else {
          Alert.alert("ข้อผิดพลาด", "Invalid OTP");
        }
        return;
      }
      try {
        const identity = phoneNumber;
        const userData = await login(identity, phoneNumber);

        // ✅ เช็ค is_banned หลัง login สำเร็จ
        if (userData?.is_banned === 1) {
          if (Platform.OS === 'web') {
            window.alert("ถูกระงับการใช้งาน\nบัญชีของคุณถูกระงับการใช้งาน\nกรุณาติดต่อผู้ดูแลระบบ");
          } else {
            Alert.alert("ถูกระงับการใช้งาน", "บัญชีของคุณถูกระงับการใช้งาน\nกรุณาติดต่อผู้ดูแลระบบ");
          }
          return; // หยุดไม่ให้เข้าแอป
        }

        navigation.replace('MainTabs');
      } catch (error) {
        const msg = error.message || "Please check your information";
        if (Platform.OS === 'web') {
          window.alert(`Login failed\n${msg}`);
        } else {
          Alert.alert("Login failed", msg);
        }
      }
    }
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
          {/* 2. Logo */}
          <Image 
            source={require('../assets/image.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />

          {/* 3. Text Section */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{step === 1 ? "You don't have to study alone anymore" : "ENTER YOUR CONFIRMATION CODE"}</Text>
            <Text style={styles.subtitle}>{step === 1 ? "Find your people and grow together" : `Sent to: ${countryCode} ${phoneNumber}`}</Text>
          </View>

          {/* 4. Input Section & Dropdown Wrapper */}
          <View style={styles.inputAreaWrapper}>
            {step === 1 ? (
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
                  maxLength={10} // ✅ จำกัดแค่ 10 หลัก
                />
              </View>
            ) : (
              <View style={styles.otpWrapper}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (otpRefs.current[index] = ref)}
                    style={styles.otpInput}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                  />
                ))}
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

          {/* 5. Action Buttons */}
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={handleContinue} 
            activeOpacity={0.8}
          >
            <Text style={styles.continueText}>{step === 1 ? 'Continue' : 'Verify & Login'}</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerHorizontal} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.dividerHorizontal} />
          </View>

          <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
            <Ionicons name="logo-google" size={20} color="#DB4437" style={styles.socialIcon} />
            <Text style={styles.socialText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
            <Ionicons name="logo-apple" size={20} color="#000" style={styles.socialIcon} />
            <Text style={styles.socialText}>Continue with Apple</Text>
          </TouchableOpacity>

          {/* 6. Footer Terms */}
          <View style={{ flex: 1, minHeight: 40 }} />
          <View style={styles.footerContainer}>
             <Text style={styles.footerText}>
                By clicking continue, you agree to our{" "}
                <Text style={styles.linkText}>Terms of Service</Text>{"\n"}
                and <Text style={styles.linkText}>Privacy Policy</Text>
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
  header: { 
    width: '100%', 
    alignItems: 'flex-start', 
    marginBottom: 10 
  },
  backButton: { 
    padding: 8, 
    marginLeft: -8 
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
  continueButton: { 
    backgroundColor: '#000', 
    height: 56, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 24 
  },
  continueText: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  dividerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 24 
  },
  dividerHorizontal: { 
    flex: 1, 
    height: 1, 
    backgroundColor: '#D1D5DB' 
  },
  orText: { 
    marginHorizontal: 12, 
    color: '#6B7280', 
    fontSize: 14 
  },
  socialButton: {
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
  socialIcon: { 
    marginRight: 10 
  },
  socialText: { 
    color: '#111827', 
    fontSize: 15, 
    fontWeight: '600' 
  },
  footerContainer: { 
    marginTop: 'auto', 
    paddingBottom: 10 
  },
  footerText: { 
    textAlign: 'center', 
    color: '#9CA3AF', 
    fontSize: 12, 
    lineHeight: 18 
  },
  linkText: { 
    color: '#111827', 
    fontWeight: '500' 
  },
});