import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from '../../FirebaseConfig';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';

interface HistoryRecord {
  id: string;
  bookTitle: string;
  borrowDate: Date;
  returnDate: Date;
  returned: boolean;
}

const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = FIREBASE_AUTH.currentUser?.uid;

  // Fungsi untuk menambahkan data dummy ke Firestore
  const addDummyData = async () => {
    if (userId) {
      const borrowDate = new Date();
      const returnDate = new Date(borrowDate);
      returnDate.setDate(returnDate.getDate() + 7);

      const dummyData = {
        userId: userId,
        bookTitle: "Atomic Habits",
        borrowDate: borrowDate,
        returnDate: returnDate,
        returned: false,
      };

      try {
        await addDoc(collection(FIREBASE_DB, 'borrowHistory'), dummyData);
        console.log("Dummy data added successfully");
      } catch (error) {
        console.error("Error adding dummy data:", error);
      }
    }
  };

  // Ambil data dari Firestore berdasarkan userId
  useEffect(() => {
    if (userId) {
      const historyRef = collection(FIREBASE_DB, 'borrowHistory');
      const q = query(historyRef, where('userId', '==', userId));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedHistory = snapshot.docs.map((doc) => {
          const data = doc.data();
          
          // Cek dan konversikan Timestamp ke Date jika diperlukan
          return {
            id: doc.id,
            bookTitle: data.bookTitle,
            borrowDate: data.borrowDate instanceof Date ? data.borrowDate : data.borrowDate.toDate(),
            returnDate: data.returnDate instanceof Date ? data.returnDate : data.returnDate.toDate(),
            returned: data.returned,
          };
        });
        setHistory(fetchedHistory);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [userId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading history...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: '#161622' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FFA001' }}>Borrowing History</Text>
      
      {/* Tombol untuk menambahkan data dummy */}
      <TouchableOpacity 
        onPress={addDummyData} 
        style={{ marginVertical: 16, padding: 10, backgroundColor: '#FFA001', borderRadius: 5 }}
      >
        <Text style={{ color: '#161622', textAlign: 'center', fontWeight: 'bold' }}>Add Dummy Data</Text>
      </TouchableOpacity>

      <ScrollView>
        {history.length > 0 ? (
          history.map((record, index) => (
            <View key={record.id} style={{ marginVertical: 10, padding: 16, backgroundColor: '#393646', borderRadius: 8 }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>
                {index + 1}. {record.bookTitle}
              </Text>
              <Text style={{ color: '#FFA001' }}>Borrowed on: {new Date(record.borrowDate).toLocaleDateString()}</Text>
              <Text style={{ color: '#FFA001' }}>Return Date: {new Date(record.returnDate).toLocaleDateString()}</Text>
              <Text style={{ color: record.returned ? 'green' : 'red' }}>
                Status: {record.returned ? 'Returned' : 'Not Returned'}
              </Text>
            </View>
          ))
        ) : (
          <Text style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>No history records found</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default History;
