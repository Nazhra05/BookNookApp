import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { getDoc, doc } from 'firebase/firestore';
import QRCode from 'react-native-qrcode-svg';

const BarcodeScreen = () => {
  const [barcode, setBarcode] = useState('');
  const auth = FIREBASE_AUTH;

  useEffect(() => {
    const fetchBarcode = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(FIREBASE_DB, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBarcode(docSnap.data().barcode);
        } else {
          console.log('No such document!');
        }
      }
    };

    fetchBarcode();
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-[#161622] p-4">
      <Text className="text-5xl font-bold text-white mb-4">Your Barcode</Text>
      {barcode ? (
        <QRCode value={barcode} size={200} />
      ) : (
        <Text className="text-lg text-white">Loading...</Text>
      )}
    </View>
  );
};

export default BarcodeScreen;
