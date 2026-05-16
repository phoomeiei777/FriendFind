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
  Dimensions,
  Modal,
  Alert,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const SPACING = 10;
const GRID_PADDING = 24;
const COL_WIDTH = (width - GRID_PADDING * 2 - SPACING * 2) / 3;

export default function RegisterScreen({ navigation }) {
  const [step, setStep] = useState(1);

  // States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpRefs = useRef([]);
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  const [major, setMajor] = useState('');
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [bio, setBio] = useState('');

  const [actualOtp, setActualOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);



  // Custom Toast State (Dynamic Island)
  const [toastMessage, setToastMessage] = useState('');
  const islandWidth = useRef(new Animated.Value(125)).current;
  const islandHeight = useRef(new Animated.Value(37)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const showToast = (message) => {
    setToastMessage(message);

    // Expand the island
    Animated.spring(islandWidth, {
      toValue: width - 32, // Expand to almost full width
      useNativeDriver: false,
      friction: 8,
      tension: 60,
    }).start();

    Animated.spring(islandHeight, {
      toValue: 90, // Expand height further
      useNativeDriver: false,
      friction: 8,
      tension: 60,
    }).start();

    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 250,
      delay: 150, // Fade text in right after starting expansion
      useNativeDriver: true,
    }).start();

    // Hide after 4 seconds
    setTimeout(() => {
      // Fade out text first
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();

      // Then shrink back to pill shape
      setTimeout(() => {
        Animated.spring(islandWidth, {
          toValue: 125,
          useNativeDriver: false,
          friction: 9,
          tension: 40,
        }).start();

        Animated.spring(islandHeight, {
          toValue: 37,
          useNativeDriver: false,
          friction: 9,
          tension: 40,
        }).start();
      }, 150);
    }, 4000);
  };

  // UI States for Pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

  useEffect(() => {
    let timer;
    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && actualOtp !== '') {
      setActualOtp('');
    }
    return () => clearInterval(timer);
  }, [timeLeft, actualOtp]);

  const resendOtp = () => {
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setActualOtp(generatedOtp);
    setTimeLeft(30);
    setOtp(['', '', '', '']);
    showToast(`Your OTP is: ${generatedOtp}`);
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      setBirthday(`${day}/${month}/${year}`);
    }
  };

  const { register, login } = useApp();
  const GOALS = [
    { text: "Find study partners", icon: "people-outline" },
    { text: "Stay motivated", icon: "flame-outline" },
    { text: "Prepare for exams", icon: "document-text-outline" },
    { text: "Improve my grades", icon: "trending-up-outline" },
    { text: "Join group study", icon: "library-outline" },
    { text: "Learn new skills", icon: "bulb-outline" }
  ];

  const handleNext = async () => {
    if (step === 1) {
      if (!email || !email.includes('@')) {
        Alert.alert("Failed", "Please enter a valid email address.");
        return;
      }
      if (!password || password.length < 6) {
        Alert.alert("Failed", "Password must be at least 6 characters.");
        return;
      }
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setActualOtp(generatedOtp);
      setTimeLeft(30);
      setOtp(['', '', '', '']);
      showToast(`OTP for ${email} is: ${generatedOtp}`);
      setStep(2);
    } else if (step === 2) {
      const enteredOtp = otp.join('');
      if (timeLeft === 0) {
        Alert.alert("Expired", "Your OTP has expired. Please try again.");
        return;
      }
      if (enteredOtp !== actualOtp) {
        Alert.alert("Invalid OTP", "The code you entered is incorrect.");
        return;
      }
      setStep(3);
    } else if (step < 5) {
      setStep(step + 1);
    } else {
      try {
        await register({
          username: name || email.split('@')[0],
          email: email,
          phone: phone || 'N/A',
          password: password,
          faculty: major || 'N/A',
          year: 1,
          interests: `Goals: ${selectedGoals.join(', ')} | Bio: ${bio}`,
          profile_image_url: images[0] || ''
        });

        // Auto-login after registration
        await login(email, password);
        navigation.replace('MainTabs'); // Finished registration
      } catch (error) {
        alert("Registration failed: " + (error.message || "Unknown error"));
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const toggleGoal = (goal) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else {
      if (selectedGoals.length < 5) {
        setSelectedGoals([...selectedGoals, goal]);
      }
    }
  };

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

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Image source={require('../assets/image.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.questionTitle}>Create an account</Text>

      <View style={styles.inputWrapper}>
        <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
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

      <View style={[styles.inputWrapper, { marginTop: 12 }]}>
        <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password (min 6 chars)"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />
      </View>
      <Text style={[styles.helperText, { marginTop: 12 }]}>We'll send a verification code to your email.</Text>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Image source={require('../assets/image.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.titleLarge}>ENTER YOUR CONFIRMATION CODE</Text>
      <Text style={styles.subtitleGray}>Sent to: {email}</Text>

      <View style={styles.otpContainer}>
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

      {timeLeft > 0 ? (
        <Text style={styles.timerText}>
          Resend in <Text style={{ color: '#F58882', fontWeight: 'bold' }}>{timeLeft}</Text> seconds
        </Text>
      ) : (
        <TouchableOpacity onPress={resendOtp}>
          <Text style={styles.resendText}>Didn't receive the code? Resend OTP</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.inputLabel}>What's your name?</Text>
      <TextInput
        style={styles.formInput}
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.inputLabel}>Phone number (Optional)</Text>
      <TextInput
        style={styles.formInput}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="Enter your phone number"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.inputLabel}>When's your birthday?</Text>
      <TouchableOpacity style={styles.formInputContainer} onPress={() => setShowDatePicker(true)}>
        <TextInput
          style={styles.inputFlex}
          value={birthday}
          placeholder="Select your birthday"
          placeholderTextColor="#9CA3AF"
          editable={false}
          pointerEvents="none"
        />
        <Ionicons name="calendar-outline" size={20} color="#000" />
      </TouchableOpacity>

      <Text style={styles.inputLabel}>What gender are you?</Text>
      <TouchableOpacity style={styles.formInputContainer} onPress={() => setShowGenderPicker(true)}>
        <TextInput
          style={styles.inputFlex}
          value={gender}
          placeholder="Select your gender"
          placeholderTextColor="#9CA3AF"
          editable={false}
          pointerEvents="none"
        />
        <Ionicons name="chevron-down" size={20} color="#000" />
      </TouchableOpacity>

      <Text style={styles.inputLabel}>What is your major?</Text>
      <TextInput
        style={styles.formInput}
        value={major}
        onChangeText={setMajor}
      />
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.headerRightAlt}>
        <TouchableOpacity onPress={handleNext}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.titleCenterAlt}>What are your main goals?</Text>
      <Text style={styles.subtitleCenterAlt}>Select up to 5 goals to help us match you with the perfect study partners.</Text>

      <View style={styles.counterBadge}>
        <Text style={styles.counterBadgeText}>{selectedGoals.length}/5 Selected</Text>
      </View>

      <View style={styles.goalsContainer}>
        {GOALS.map((goal, index) => {
          const isSelected = selectedGoals.includes(goal.text);
          return (
            <TouchableOpacity
              key={index}
              style={[styles.goalPill, isSelected && styles.goalPillSelected]}
              onPress={() => toggleGoal(goal.text)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isSelected ? goal.icon.replace('-outline', '') : goal.icon}
                size={20}
                color={isSelected ? '#F58882' : '#6B7280'}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.goalText, isSelected && styles.goalTextSelected]}>{goal.text}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const [images, setImages] = useState([null, null, null, null, null, null]);

  const pickImage = async (index) => {
    Alert.alert(
      "Select Photo",
      "Choose an option",
      [
        { text: "Camera", onPress: () => openCamera(index) },
        { text: "Gallery", onPress: () => openLibrary(index) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const openCamera = async (index) => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert("Camera permission required");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      aspect: [16, 9],
      quality: 0.5,
    });
    if (!result.canceled) {
      const newImages = [...images];
      newImages[index] = result.assets[0].uri;
      setImages(newImages);
    }
  };

  const openLibrary = async (index) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      aspect: [16, 9],
      quality: 0.5,
    });
    if (!result.canceled) {
      const newImages = [...images];
      newImages[index] = result.assets[0].uri;
      setImages(newImages);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  const renderImageSlot = (index, w, h) => {
    const uri = images[index];
    const num = index + 1;
    return (
      <TouchableOpacity
        onPress={() => uri ? null : pickImage(index)}
        style={[
          styles.photoBox,
          { width: w, height: h },
          !uri && styles.photoBoxEmpty
        ]}
      >
        {uri ? (
          <>
            <Image source={{ uri }} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
            <TouchableOpacity
              style={styles.deleteBtnSmall}
              onPress={() => removeImage(index)}
            >
              <Ionicons name="close-circle" size={24} color="#F58882" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.photoNumberBadge}>
              <Text style={styles.photoNumberText}>{num}</Text>
            </View>
            <View style={styles.addIconContainer}>
              <Ionicons name="add" size={24} color="#FFF" />
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  };

  const renderStep5 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.textHeaderContainer}>
        <Text style={styles.titleStep5}>Show your best self</Text>
        <Text style={styles.subtitleStep5}>Add at least 2 photos to stand out</Text>
      </View>

      <View style={styles.gridContainerAlt}>
        <View style={styles.rowAlt}>
          {renderImageSlot(0, COL_WIDTH * 2 + SPACING, 200)}
          <View style={{ justifyContent: 'space-between' }}>
            {renderImageSlot(1, COL_WIDTH, 95)}
            {renderImageSlot(2, COL_WIDTH, 95)}
          </View>
        </View>
        <View style={styles.rowAlt}>
          {renderImageSlot(3, COL_WIDTH, 140)}
          {renderImageSlot(4, COL_WIDTH, 140)}
          {renderImageSlot(5, COL_WIDTH, 140)}
        </View>
      </View>

      <View style={styles.bioSection}>
        <View style={styles.bioHeader}>
          <Text style={styles.titleBio}>About Me</Text>
          <Text style={styles.charCount}>{bio.length}/200</Text>
        </View>
        <TextInput
          style={styles.bioInput}
          multiline
          placeholder="Share something interesting about yourself, your hobbies, or what you're looking for in a study partner..."
          placeholderTextColor="#9CA3AF"
          maxLength={200}
          value={bio}
          onChangeText={setBio}
        />
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FECEE6']}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Animated Dynamic Island Toast */}
        <Animated.View style={[styles.dynamicToastContainer, { width: islandWidth, height: islandHeight }]}>
          <Animated.View style={[styles.dynamicToastContent, { opacity: contentOpacity }]}>
            <View style={styles.toastIcon}>
              <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" />
            </View>
            <View style={styles.toastContentText}>
              <Text style={styles.toastTitle}>Messages</Text>
              <Text style={styles.toastMessage}>{toastMessage}</Text>
            </View>
          </Animated.View>
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.flexScrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}
          </ScrollView>

          {/* Date Picker Modal */}
          {Platform.OS === 'ios' && showDatePicker && (
            <Modal
              transparent
              animationType="slide"
              visible={showDatePicker}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.pickerContainer}>

                  {/* แถบหัวข้อด้านบนที่มีสองปุ่มแยกฝั่งกัน */}
                  <View style={styles.pickerHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.pickerCancelText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.pickerDoneText}>Done</Text>
                    </TouchableOpacity>
                  </View>

                  {/* ตัวหมุนเลือกวันที่ (จัดให้อยู่ตรงกลางจอ) */}
                  <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                      textColor="black"
                      style={{ width: '100%' }}
                    />
                  </View>

                </View>
              </View>
            </Modal>
          )}

          {/* Gender Picker Bottom Sheet Modal */}
          {showGenderPicker && (
            <Modal transparent animationType="fade" visible={showGenderPicker}>
              <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowGenderPicker(false)}>
                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownTitle}>Select Gender</Text>
                  {GENDERS.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.dropdownItem, gender === item && styles.dropdownItemSelected]}
                      onPress={() => {
                        setGender(item);
                        setShowGenderPicker(false);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, gender === item && styles.dropdownItemTextSelected]}>{item}</Text>
                      {gender === item && <Ionicons name="checkmark-circle" size={24} color="#F58882" />}
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            </Modal>
          )}

          {/* Fixed bottom button inside KeyboardAvoidingView to push up natively */}
          <View style={styles.fixedBottomContainer}>
            <TouchableOpacity style={styles.fixedButton} onPress={handleNext}>
              <Text style={styles.buttonText}>
                {step === 1 ? 'Send code' : step === 5 ? 'Create Account' : 'CONTINUE'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  dynamicToastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 12 : 15,
    alignSelf: 'center',
    backgroundColor: '#000000',
    borderRadius: 30, // Ensures perfect pill shape when collapsing
    overflow: 'hidden',
    zIndex: 9999,
    elevation: 10,
    justifyContent: 'center',
  },
  dynamicToastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    width: '100%',
  },
  toastIcon: {
    backgroundColor: '#34D399', // SMS Green indicator
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  toastContentText: {
    flex: 1,
  },
  toastTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  toastMessage: {
    color: '#D1D5DB', // Light gray for subtler look
    fontSize: 13,
    lineHeight: 18,
  },
  safeArea: {
    flex: 1,
    // background color removed to show gradient
  },
  container: {
    flex: 1,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  flexScrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 20, // Let the flex container breathe when button takes space natively
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 55,
    width: '100%',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  helperText: {
    fontSize: 13,
    color: '#9CA3AF',
    alignSelf: 'flex-start',
  },
  fixedBottomContainer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 0 : 20, // SafeAreaView already handles iOS bottom, so 0 is perfect.
    backgroundColor: 'transparent', // Match background to merge seamlessly
  },
  fixedButton: {
    backgroundColor: '#F58882',
    width: '100%',
    height: 55,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Step 2
  titleLarge: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    marginBottom: 8,
  },
  subtitleGray: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 30,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 0,
  },
  otpInputSmall: {
    width: 45,
    height: 55,
    backgroundColor: '#FFF',
    borderRadius: 8,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  otpInput: {
    width: 85, // ใหญ่ขึ้น
    height: 85, // สูงขึ้น
    backgroundColor: '#FFF',
    borderRadius: 16, // มนสวยขึ้น
    fontSize: 32, // ตัวเลขใหญ่ขึ้นเบ้อเริ่ม
    fontWeight: '800',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  resendText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 10,
  },
  timerText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 10,
  },

  // Step 3
  inputLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    alignSelf: 'flex-start',
    marginTop: 20,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#FFF',
    width: '100%',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  formInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    width: '100%',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  inputFlex: {
    flex: 1,
    fontSize: 15,
  },

  // Step 4
  headerRightAlt: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  titleCenterAlt: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleCenterAlt: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  counterBadge: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  counterBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  goalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  goalPillSelected: {
    borderColor: '#F58882',
    backgroundColor: '#FFF0F0',
  },
  goalText: {
    color: '#4B5563',
    fontSize: 15,
    fontWeight: '600',
  },
  goalTextSelected: {
    color: '#F58882',
    fontWeight: '700',
  },

  // --- สไตล์ที่ปรับปรุงใหม่สำหรับ Step 5 ---
  textHeaderContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  titleStep5: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  subtitleStep5: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 6,
  },
  gridContainerAlt: {
    width: '100%',
  },
  rowAlt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING,
  },
  photoBox: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'visible', // Ensure close icon is visible
  },
  photoBoxEmpty: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#F58882',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnSmall: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    zIndex: 10,
  },
  // สไตล์ปุ่มบวก (+)
  addIconContainer: {
    backgroundColor: '#F58882',
    borderRadius: 100,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Badge ตัวเลข (วงกลมสีเทา)
  photoNumberBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#9CA3AF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  photoNumberText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // ส่วน About Me (สีขาวโค้งมน)
  bioSection: {
    width: '100%',
    marginTop: 30,
  },
  bioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  titleBio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  bioInput: {
    backgroundColor: '#FFF',
    width: '100%',
    minHeight: 125,
    borderRadius: 20, // โค้งมนมากขึ้นตามภาพ
    padding: 20,
    fontSize: 15,
    color: '#374151',
    textAlignVertical: 'top',
    // เงาที่นุ่มนวล
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#FFF',
    paddingBottom: 30, // For iOS home indicator safe area
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerHeader: {
    width: '100%',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pickerDoneText: {
    color: '#F58882',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dropdownContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    paddingBottom: 40, // For Android/iOS safe area
  },
  inlineCountryDropdown: {
    position: 'absolute',
    top: 60, // Just below the phoneInputContainer height (55)
    left: 0,
    width: 140, // Snug size to hug the left corner
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 9999, // Render over everything
  },
  inlineDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  inlineDropdownItemSelected: {
    backgroundColor: '#FFF0F0',
  },
  inlineDropdownText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  inlineDropdownTextSelected: {
    color: '#F58882',
    fontWeight: '700',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 10,
    backgroundColor: '#F9FAFB', // Light gray background for items
  },
  dropdownItemSelected: {
    backgroundColor: '#FFF0F0', // Soft pink background to match theme
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
  },
  dropdownItemTextSelected: {
    color: '#F58882',
    fontWeight: '700',
  },
});
