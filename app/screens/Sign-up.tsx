import React, { useEffect, useState } from 'react';
import {
  Text, TextInput, View, TouchableOpacity,
  ActivityIndicator, Image, Alert, KeyboardAvoidingView,
  Platform, TouchableWithoutFeedback, Keyboard, ScrollView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FIREBASE_AUTH, FIREBASE_DB, FIREBASE_STORAGE } from '../../FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut, onAuthStateChanged } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { setDoc, doc, onSnapshot } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [documentUri, setDocumentUri] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        const userRef = doc(FIREBASE_DB, 'users', user.uid);
        const unsubscribeSnapshot = onSnapshot(userRef, async (snapshot) => {
          const userData = snapshot.data();
          if (userData && userData.isAdminApproved && !user.emailVerified) {
            try {
              await sendEmailVerification(user);
              Alert.alert('Success', 'Your email has been verified. Please check your inbox.');
            } catch (error) {
              console.error('Error sending email verification:', error);
            }
          }
        });
        return () => unsubscribeSnapshot();
      }
    });
    return () => unsubscribe();
  }, []);

  const pickDocument = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setDocumentUri(result.assets[0].uri);
    }
  };

  const uploadDocument = async (uri: string, uid: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(FIREBASE_STORAGE, `self_documents/${uid}`);
    await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  };

  const signUp = async () => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;

      const barcode = `barcode-${user.uid}`;
      const documentUrl = documentUri ? await uploadDocument(documentUri, user.uid) : '';

      const userRef = doc(FIREBASE_DB, 'users', user.uid);
      await setDoc(userRef, {
        email: user.email,
        uid: user.uid,
        username: username,
        phoneNumber: phoneNumber,
        barcode: barcode,
        documentUrl: documentUrl,
        isAdminApproved: false,
      });

      await signOut(FIREBASE_AUTH);
      Alert.alert('Success', 'Sign up successful! Please wait for admin approval.', [
        { text: 'OK', onPress: () => navigation.navigate('PendingVerification') }
      ]);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'Email already in use.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Error', 'Password should be at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'Invalid email address.');
      } else {
        console.error('Error signing up:', error);
        Alert.alert('Error', 'An error occurred during sign up.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ flex: 1, backgroundColor: '#161622', padding: 16 }}>
            <Text style={{ fontSize: 40, fontWeight: 'bold', color: 'white', marginBottom: 30, marginTop: 14 }}>Create Account</Text>
            <Image source={require('../../assets/images/logo.png')} style={{ width: 190, height: 55, marginTop: 10 }} />
            <Text style={{ fontSize: 18, color: 'white', marginBottom: 5 }}>
              Discover Endless Possibilities with <Text style={{ color: '#FF8C00' }}>BookNook</Text>
            </Text>

            <TextInput
              style={{ width: '100%', borderColor: '#D3D3D3', borderWidth: 2, borderRadius: 5, padding: 12, marginBottom: 16, backgroundColor: 'white', color: 'black' }}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={{ width: '100%', position: 'relative', marginBottom: 16 }}>
              <TextInput
                style={{ width: '100%', borderColor: '#D3D3D3', borderWidth: 2, borderRadius: 5, padding: 12, paddingRight: 40, backgroundColor: 'white', color: 'black' }}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={{ position: 'absolute', right: 16, top: 12 }}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="#888"
                />
              </TouchableOpacity>
            </View>

            <TextInput
              style={{ width: '100%', borderColor: '#D3D3D3', borderWidth: 2, borderRadius: 5, padding: 12, marginBottom: 16, backgroundColor: 'white', color: 'black' }}
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="#888"
            />

            <TextInput
              style={{ width: '100%', borderColor: '#D3D3D3', borderWidth: 2, borderRadius: 5, padding: 12, marginBottom: 16, backgroundColor: 'white', color: 'black' }}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Phone Number"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
            />

            <View style={{ alignItems: 'flex-start', marginBottom: 16 }}>
              <Text style={{ color: 'white', marginBottom: 5 }}>Upload Proof of Self Documents</Text>
              <TouchableOpacity onPress={pickDocument}>
                <View style={{ width: 150, height: 200, borderWidth: 2, borderColor: '#D3D3D3', borderRadius: 5, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9' }}>
                  {documentUri ? (
                    <Image source={{ uri: documentUri }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <View style={{ alignItems: 'center' }}>
                      <Ionicons name="document-outline" size={40} color="#888" />
                      <Text style={{ color: '#888', marginTop: 10 }}>Upload Document</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={{ width: '100%', backgroundColor: '#FF8C00', padding: 12, borderRadius: 5 }}
              onPress={signUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <View style={{ marginTop: 20 }}>
              <Text style={{ color: '#CDCDE0', fontSize: 16 }}>
                Already have an account?{' '}
                <Text onPress={() => navigation.navigate('Login')} style={{ color: '#FF8C00'}}>
                  Sign in here.
                </Text>
              </Text>
            </View>
            
            <StatusBar style="auto" />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default SignUp;
