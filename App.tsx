import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from './FirebaseConfig';
import { Ionicons, Entypo, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';

// Import your screens
import Login from './app/screens/Login';
import History from './app/tabs/History';
import Home from './app/tabs/Home';
import Signup from './app/screens/Sign-up';
import ProfileScreen from './app/tabs/Profile';
import BarcodeScreen from './app/tabs/Barcode';
import PendingVerification from './app/screens/PendingVerification';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return <Entypo name="home" size={size} color={color} />;
          } else if (route.name === 'History') {
            return <MaterialIcons name="format-list-bulleted-add" size={size} color={color} />;
          } else if (route.name === 'Barcode') {
            return <MaterialCommunityIcons name="barcode" size={size} color={color} />;
          } else if (route.name === 'Profile') {
            return <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: "#FFA001",
        tabBarInactiveTintColor: "#CDCDE0",
        tabBarStyle: {
          backgroundColor: '#161622',
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          paddingTop: 5,
          height: Platform.OS === 'ios' ? 60 : 50,
          borderTopColor: '#232533',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={Home} 
        options={{ headerShown: false }} 
      />
      <Tab.Screen name="History" component={History} options={{ headerShown: false }}/>
      <Tab.Screen name="Barcode" component={BarcodeScreen} options={{ headerShown: false }}/>
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }}/>
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = doc(FIREBASE_DB, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setIsVerified(userDoc.data().isAdminApproved);
        }
      }
    });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {user ? (
          isVerified === true ? (
            <Stack.Screen name="TabNavigator" component={TabNavigator} options={{ headerShown: false }} />
          ) : (
            <Stack.Screen name="PendingVerification" component={PendingVerification} options={{ headerShown: false }} />
          )
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
