import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');
const SPACING = 10;
const GRID_PADDING = 20;
const COL_WIDTH = (width - GRID_PADDING * 2 - SPACING * 2) / 3;

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, updateProfile } = useApp();
  const [bio, setBio] = useState(user?.interests || '');
  const [faculty, setFaculty] = useState(user?.faculty || '');
  const [year, setYear] = useState(String(user?.year || ''));
  
  // New profile fields
  const [pronouns, setPronouns] = useState(user?.pronouns || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [studyGoal, setStudyGoal] = useState(user?.study_goal || '');
  const [lookingFor, setLookingFor] = useState(user?.looking_for || '');
  const [studyStyle, setStudyStyle] = useState(user?.study_style || '');
  const [studyTime, setStudyTime] = useState(user?.study_time || '');
  const [studyLocation, setStudyLocation] = useState(user?.study_location || '');
  const [studyVibe, setStudyVibe] = useState(user?.study_vibe || '');
  const [strength, setStrength] = useState(user?.strength || '');
  const [weakness, setWeakness] = useState(user?.weakness || '');

  // Initialize images state with 6 slots
  const [images, setImages] = useState(new Array(6).fill(null));

  useEffect(() => {
    if (user) {
      const userImages = user.images || [user.profile_image_url].filter(Boolean);
      const newImages = new Array(6).fill(null);
      userImages.slice(0, 6).forEach((img, i) => {
        newImages[i] = img;
      });
      setImages(newImages);
      
      // Update new fields if they exist in user object
      setPronouns(user.pronouns || '');
      setGender(user.gender || '');
      setStudyGoal(user.study_goal || '');
      setLookingFor(user.looking_for || '');
      setStudyStyle(user.study_style || '');
      setStudyTime(user.study_time || '');
      setStudyLocation(user.study_location || '');
      setStudyVibe(user.study_vibe || '');
      setStrength(user.strength || '');
      setWeakness(user.weakness || '');
    }
  }, [user]);

  const showOptions = (label, options, setter) => {
    const buttons = options.map(opt => ({
      text: opt,
      onPress: () => setter(opt)
    }));
    buttons.push({ text: "Cancel", style: "cancel" });
    Alert.alert(label, `Select your ${label.toLowerCase()}`, buttons);
  };

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
      updateImageAt(index, result.assets[0].uri);
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
      updateImageAt(index, result.assets[0].uri);
    }
  };

  const updateImageAt = (index, uri) => {
    const newImages = [...images];
    newImages[index] = uri;
    setImages(newImages);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  const handleSave = async () => {
    try {
      const finalImages = images.filter(img => img !== null);
      if (finalImages.length === 0) {
        alert("Please add at least one profile picture");
        return;
      }

      await updateProfile({
        faculty,
        year: parseInt(year) || null,
        interests: bio,
        images: finalImages,
        pronouns,
        gender,
        study_goal: studyGoal,
        looking_for: lookingFor,
        study_style: studyStyle,
        study_time: studyTime,
        study_location: studyLocation,
        study_vibe: studyVibe,
        strength,
        weakness
      });
      alert("Profile updated successfully!");
      navigation.goBack();
    } catch (e) {
      alert(e.message || "Update failed");
    }
  };

  const renderImageSlot = (index, w, h) => {
    const uri = images[index];
    return (
      <TouchableOpacity 
        style={[styles.imageWrapper, { width: w, height: h }]} 
        onPress={() => pickImage(index)}
        activeOpacity={0.9}
      >
        {uri ? (
          <>
            <Image source={{ uri }} style={styles.image} resizeMode="cover" />
            <TouchableOpacity style={styles.deleteBtn} onPress={() => removeImage(index)} activeOpacity={0.7}>
              <Ionicons name="close" size={14} color="#000" />
            </TouchableOpacity>
            {index === 0 && (
              <View style={styles.profileBadge}>
                <Text style={styles.profileBadgeText}>Profile</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.placeholderBox}>
            <Ionicons name="add" size={32} color="#8E8E93" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderListItem = (label, value, onChange) => (
    <View style={styles.listItemContainer}>
      <Text style={styles.listItemLabel}>{label}</Text>
      <TextInput
        style={styles.listItemInput}
        value={value}
        onChangeText={onChange}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor="#8E8E93"
      />
    </View>
  );

  const renderSelectableItem = (label, value, options, setter) => (
    <TouchableOpacity 
      style={styles.listItemContainer} 
      onPress={() => showOptions(label, options, setter)}
      activeOpacity={0.7}
    >
      <Text style={styles.listItemLabel}>{label}</Text>
      <Text style={[styles.listItemValue, value ? { color: '#000' } : { color: '#8E8E93' }]}>
        {value || `Select ${label.toLowerCase()}`}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingRight: 10 }}>
          <Ionicons name="chevron-back" size={32} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Include up to 6 images in your profile</Text>

        {/* Image Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.row}>
            {renderImageSlot(0, COL_WIDTH * 2 + SPACING, 200)}
            <View style={{ justifyContent: 'space-between' }}>
              {renderImageSlot(1, COL_WIDTH, 95)}
              {renderImageSlot(2, COL_WIDTH, 95)}
            </View>
          </View>
          <View style={styles.row}>
            {renderImageSlot(3, COL_WIDTH, 140)}
            {renderImageSlot(4, COL_WIDTH, 140)}
            {renderImageSlot(5, COL_WIDTH, 140)}
          </View>
        </View>

        {/* Basic Info */}
        <Text style={styles.sectionTitle}>Basic Info</Text>
        {renderListItem('Faculty', faculty, setFaculty)}
        {renderListItem('Year', year, setYear)}

        {/* Bio Section */}
        <Text style={styles.sectionTitle}>Bio</Text>
        <View style={styles.bioContainer}>
          <Text style={styles.listItemLabel}>About me</Text>
          <TextInput
            style={styles.bioInput}
            placeholder="..."
            placeholderTextColor="#8E8E93"
            multiline
            value={bio}
            onChangeText={setBio}
            textAlignVertical="top"
          />
        </View>

        <View style={{ marginTop: 10 }}>
          {renderSelectableItem('Pronouns', pronouns, ['He/his', 'She/her', 'They/them', 'Other'], setPronouns)}
          {renderSelectableItem('Gender Identity', gender, ['Man', 'Woman', 'Non-binary', 'Other'], setGender)}
          {renderSelectableItem('Study Goal', studyGoal, ['เตรียมสอบ', 'ทำโปรเจกต์', 'หาเพื่อนติว', 'อื่นๆ'], setStudyGoal)}
          {renderSelectableItem('Looking For', lookingFor, ['เพื่อนติว', 'เพื่อนคุย', 'เมท', 'อื่นๆ'], setLookingFor)}
        </View>

        {/* Fun Facts Section */}
        <Text style={styles.sectionTitle}>Fun Facts</Text>
        {renderSelectableItem('Study Style', studyStyle, ['อ่านเงียบๆ', 'อ่านไปคุยไป', 'เน้นติวให้คนอื่น', 'เน้นให้คนอื่นติวให้'], setStudyStyle)}
        {renderSelectableItem('Study Time', studyTime, ['เช้า', 'บ่าย', 'ค่ำ', 'ดึก'], setStudyTime)}
        {renderSelectableItem('Study Location', studyLocation, ['หอ/บ้าน', 'ห้องสมุด', 'คาเฟ่', 'คณะ'], setStudyLocation)}
        {renderSelectableItem('Study Vibe', studyVibe, ['น้ำเปล่า', 'กาแฟ', 'ขนม', 'ดนตรีคลอ'], setStudyVibe)}
        {renderSelectableItem('Strenght', strength, ['คำนวณ', 'ทฤษฎี', 'สรุปเก่ง', 'ความจำดี'], setStrength)}
        {renderSelectableItem('Weakness', weakness, ['ขี้เกียจ', 'สมาธิสั้น', 'ง่วงง่าย', 'อ่านไม่ทัน'], setWeakness)}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.actionBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F58882' }]} onPress={handleSave} activeOpacity={0.8}>
            <Text style={[styles.actionBtnText, { color: '#FFF' }]}>Save</Text>
          </TouchableOpacity>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFF0F5', // Light pink background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 12,
    color: '#8E8E93',
    marginVertical: 10,
  },
  gridContainer: {
    paddingHorizontal: GRID_PADDING,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 12,
    backgroundColor: '#EBEBEB',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  deleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FFF',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  placeholderBox: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#EBEBEB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderStyle: 'dashed',
  },
  profileBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#F58882',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  profileBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
    color: '#000',
  },
  bioContainer: {
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    minHeight: 120,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bioInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    fontWeight: '600',
    marginTop: 8,
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  listItemLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  listItemValue: {
    fontSize: 15,
    color: '#8E8E93',
  },
  listItemInput: {
    fontSize: 15,
    color: '#000',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginTop: 30,
  },
  actionBtn: {
    backgroundColor: '#FFF',
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
  }
});
