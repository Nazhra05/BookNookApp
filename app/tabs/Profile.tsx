import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, StatusBar } from 'react-native';
import { FIREBASE_AUTH, FIREBASE_DB, FIREBASE_STORAGE } from '../../FirebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import GlobalStyles from '../../GlobalStyles'; // Pastikan path-nya benar
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [suggestion, setSuggestion] = useState('');

  const auth = FIREBASE_AUTH;

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        setEmail(user.email);
        const userDoc = await getDoc(doc(FIREBASE_DB, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUsername(userData.username || '');
          setProfilePicture(userData.profilePicture || null);
        }
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const user = auth.currentUser;
      const storageRef = ref(FIREBASE_STORAGE, `profilePictures/${user.uid}`);
      const response = await fetch(result.assets[0].uri);
      const blob = await response.blob();
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      setProfilePicture(downloadURL);
    }
  };

  const handleSendSuggestion = async () => {
    const user = auth.currentUser;
    if (user) {
      await setDoc(doc(FIREBASE_DB, 'suggestions', `${user.uid}-${Date.now()}`), {
        userId: user.uid,
        suggestion,
        createdAt: new Date(),
      });
      alert('Suggestion sent successfully!');
      setSuggestion('');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.replace('Login'); // Navigate to the Login screen after logout
    } catch (error) {
      alert('Failed to log out: ' + error.message);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#FF8C00" />;
  }

  return (
    <SafeAreaView style={GlobalStyles.droidSafeArea}>
      <StatusBar backgroundColor="#161622" />
      <View style={{ flex: 1, backgroundColor: '#161622', padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={handleImagePicker}>
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={{ width: 48, height: 48, borderRadius: 24 }} />
            ) : (
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'gray', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 24 }}>👤</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', marginLeft: 16 }}>{username}</Text>
        </View>
        <Text style={{ fontSize: 18, color: 'white', marginBottom: 16 }}>Email: {email}</Text>
        <TextInput
          style={{ borderColor: 'gray', borderWidth: 2, borderRadius: 8, padding: 12, marginBottom: 16, backgroundColor: 'white', color: 'black' }}
          value={suggestion}
          onChangeText={setSuggestion}
          placeholder="Your suggestion"
          placeholderTextColor="#888"
          multiline
          numberOfLines={4}
        />
        <TouchableOpacity
          style={{ backgroundColor: '#FF8C00', borderRadius: 8, padding: 12, marginBottom: 16 }}
          onPress={handleSendSuggestion}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Send Suggestion</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: 'red', borderRadius: 8, padding: 12 }}
          onPress={handleLogout}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
