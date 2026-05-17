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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { login } = useApp();

  const handleNext = async () => {
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
              Login with Email
            </Text>
            <Text style={styles.subtitle}>
              Enter your credentials
            </Text>
          </View>

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

          <CustomButton 
            title="Login" 
            onPress={handleNext}
            loading={isProcessing}
          />

          <TouchableOpacity 
            style={{ marginTop: 16, alignItems: 'center' }} 
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={{ color: '#F58882', fontSize: 14, fontWeight: '600' }}>Forgot Password?</Text>
          </TouchableOpacity>

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
    height: '100%' 
  },
});