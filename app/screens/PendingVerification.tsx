import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_AUTH } from '../../FirebaseConfig';

const PendingVerification = () => {
  const navigation = useNavigation();

  const handleSignOut = () => {
    FIREBASE_AUTH.signOut().then(() => {
      navigation.navigate('Login');
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Verification</Text>
      <Text style={styles.message}>
        Your account is currently under review by the admin. You will receive an email notification once your account is verified.
      </Text>
      <Button
        title="Log Out"
        onPress={handleSignOut}
        color="#FF8C00"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#161622',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: 'white',
    marginBottom: 40,
    textAlign: 'center',
  },
});

export default PendingVerification;
