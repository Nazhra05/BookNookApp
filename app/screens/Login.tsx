import React, { useState } from 'react';
import { Text, TextInput, View, TouchableOpacity, ActivityIndicator, Image, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const auth = FIREBASE_AUTH;
  const navigation = useNavigation();

  const signIn = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        // If the user is verified, navigate to the main app screen
        navigation.navigate('TabNavigator');
      } else {
        // If the user is not verified, sign them out and show an alert
        await auth.signOut();
        Alert.alert(
          'Email Verification Required',
          'Please verify your email address before logging in. A verification link has been sent to your email.',
          [
            { text: 'OK', onPress: () => console.log('OK Pressed') }
          ]
        );
      }
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Sign in failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, backgroundColor: '#161622', padding: 16, justifyContent: 'center' }}>
          <Text style={{ fontSize: 40, fontWeight: 'bold', color: 'white', marginBottom: 40, marginTop: 40 }}>Welcome Back!</Text>
          <Image source={require('../../assets/images/logo.png')} style={{ width: 190, height: 55 }} />
          <Text style={{ fontSize: 18, color: 'white', marginBottom: 40 }}>
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
            />
            <TouchableOpacity
              style={{ position: 'absolute', right: 16, top: 12 }}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color="#888"
              />
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#FF8C00" />
          ) : (
            <>
              <TouchableOpacity
                style={{ width: '100%', backgroundColor: '#FF8C00', padding: 12, borderRadius: 5, marginBottom: 16 }}
                onPress={signIn}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Login</Text>
              </TouchableOpacity>
            </>
          )}
          <View>
            <Text style={{ fontSize: 16, color: '#CDCDE0' }}>
              Don't have an account yet?{' '}
              <Text onPress={() => navigation.navigate('Signup')} style={{ color: '#FF8C00', textDecorationLine: 'underline' }}>
                Sign Up here.
              </Text>
            </Text>
          </View>
          <StatusBar style="auto" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
