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
export default function LoginScreen({ navigation }) {
  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' or 'email'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = React.useRef([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { requestOTP, verifyOTP, login } = useApp();

  React.useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleNext = async () => {
    if (loginMethod === 'email') {
      if (!email || !password) {
        Alert.alert('Error', 'Please enter both email and password');
        return;
      }
      setIsProcessing(true);
      try {
        await login(email, password);
        navigation.replace('MainTabs');
      } catch (error) {
        Alert.alert('Error', error.message || 'Login failed');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    if (step === 1) {
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
    } else if (step === 2) {
      const enteredOtp = otp.join('');
      if (enteredOtp.length < 6) {
        Alert.alert('Error', 'Please enter a valid 6-digit code');
        return;
      }
      setIsProcessing(true);
      try {
        const syncResult = await verifyOTP(phone, enteredOtp);
        if (syncResult.isNewUser) {
          Alert.alert('New Account', 'Account not found. Please register first.');
          navigation.navigate('Register');
        } else {
          navigation.replace('MainTabs');
        }
      } catch (error) {
        Alert.alert('Error', 'Invalid code or connection error.');
      } finally {
        setIsProcessing(false);
      }
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
      <Header showBack={true} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} bounces={false}>
          {/* Logo */}
          <Image source={require('../assets/image.png')} style={styles.logo} resizeMode="contain" />

          {/* Text Section */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              {loginMethod === 'email' ? 'Login with Email' : (step === 1 ? 'Login to your account' : 'Verify Your Phone')}
            </Text>
            <Text style={styles.subtitle}>
              {loginMethod === 'email' ? 'Enter your credentials' : (step === 1 ? 'Enter your phone number' : `Enter the code sent to ${phone}`)}
            </Text>
          </View>

          {/* Toggle Method (Only in Step 1) */}
          {step === 1 && (
            <View style={styles.methodToggle}>
              <TouchableOpacity 
                style={[styles.methodBtn, loginMethod === 'phone' && styles.methodBtnActive]}
                onPress={() => setLoginMethod('phone')}
              >
                <Text style={[styles.methodText, loginMethod === 'phone' && styles.methodTextActive]}>Phone</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.methodBtn, loginMethod === 'email' && styles.methodBtnActive]}
                onPress={() => setLoginMethod('email')}
              >
                <Text style={[styles.methodText, loginMethod === 'email' && styles.methodTextActive]}>Email</Text>
              </TouchableOpacity>
            </View>
          )}

          {loginMethod === 'email' ? (
            <View style={styles.inputAreaWrapper}>
              <View style={[styles.inputContainer, { marginBottom: 16 }]}>
                <Ionicons name="mail-outline" size={20} color="#6B7280" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>
          ) : step === 1 ? (
            <View style={styles.inputAreaWrapper}>
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
            </View>
          ) : (
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
                />
              ))}
            </View>
          )}

          <CustomButton 
            title={loginMethod === 'email' ? "Login" : (step === 1 ? "Get Verification Code" : "Verify & Login")} 
            onPress={handleNext}
            loading={isProcessing}
          />

          {step === 2 && timeLeft > 0 && (
            <Text style={[styles.footerText, { marginTop: 16 }]}>Resend code in {timeLeft}s</Text>
          )}

          <View style={{ flex: 1, minHeight: 40 }} />
          <TouchableOpacity 
            style={{ alignItems: 'center', marginBottom: 20 }} 
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={{ color: '#4B5563', fontSize: 14, fontWeight: '600' }}>
              Don't have an account? <Text style={{ color: '#F58882' }}>Register here</Text>
            </Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingHorizontal: 0,
    marginBottom: 20,
  },
  otpInput: {
    width: 42,
    height: 52,
    backgroundColor: '#FFF',
    borderRadius: 10,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  methodToggle: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 25,
    padding: 4,
    marginBottom: 30,
    width: '100%',
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 21,
  },
  methodBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  methodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  methodTextActive: {
    color: '#F58882',
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