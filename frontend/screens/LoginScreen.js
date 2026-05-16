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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { login } = useApp();

  const handleLogin = async () => {
    if (!email || !password) {
      if (Platform.OS === 'web') {
        window.alert("ข้อผิดพลาด\nPlease enter email and password");
      } else {
        Alert.alert("ข้อผิดพลาด", "Please enter email and password");
      }
      return;
    }
    
    try {
      await login(email, password);
      navigation.replace('MainTabs');
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert(`Login failed\n${error.message}`);
      } else {
        Alert.alert("Login failed", error.message);
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
            <Text style={styles.title}>Login to your account</Text>
            <Text style={styles.subtitle}>Enter your email and password to continue</Text>
          </View>

          {/* 4. Input Section & Dropdown Wrapper */}
          <View style={styles.inputAreaWrapper}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                autoFocus={true}
              />
            </View>
            
            <View style={[styles.inputContainer, { marginTop: 16 }]}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {/* 5. Action Buttons */}
          <CustomButton 
            title="Login" 
            onPress={handleLogin} 
          />

          <TouchableOpacity 
            style={{ alignItems: 'center', marginBottom: 20, marginTop: -10 }} 
            onPress={() => navigation.navigate('ResetPassword')}
          >
            <Text style={{ color: '#4B5563', fontSize: 14, fontWeight: '600' }}>
              Forgot Password? <Text style={{ color: '#F58882' }}>Reset here</Text>
            </Text>
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