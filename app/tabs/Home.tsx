import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, Modal, BackHandler, StatusBar } from 'react-native';
import { FIREBASE_DB, FIREBASE_AUTH } from './../../FirebaseConfig';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalStyles from '../../GlobalStyles';
import { useFocusEffect } from '@react-navigation/native';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  available: boolean;
  imageUrl: string;
  description: string;
}

const Home: React.FC = ({ }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsername = async () => {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(FIREBASE_DB, 'users', user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username || 'User');
        } else {
          setUsername('User');
        }
      }
    };

    fetchUsername();

    const bookRef = collection(FIREBASE_DB, 'books');
    const subscriber = onSnapshot(bookRef, {
      next: (snapshot) => {
        const fetchedBooks = snapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data()
          } as Book;
        });
        setBooks(fetchedBooks);
        setLoading(false);
      },
      error: (error) => {
        console.error('Error fetching books:', error.message);
        setLoading(false);
      }
    });

    return () => {
      subscriber();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (descriptionModalVisible) {
          setDescriptionModalVisible(false);
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [descriptionModalVisible])
  );

  const handleImageClick = (book: Book) => {
    setSelectedBook(book);
    setDescriptionModalVisible(true);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading books...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={GlobalStyles.droidSafeArea} className="flex-1">
      <StatusBar backgroundColor="#161622" />
      <ScrollView className="flex-1 p-4">
        <Text className="text-5xl font-bold text-white mb-10 mt-2">Welcome Back, {username}</Text>
        {books.length > 0 ? (
          books.map((book) => (
            <View key={book.id} className="mb-4 p-4 bg-[#393646] rounded-lg shadow-md">
              <Text className="text-lg text-white font-bold">{book.title}</Text>
              <Text className="text-gray-200 mb-2">{book.author}</Text>
              <TouchableOpacity onPress={() => handleImageClick(book)}>
                <Image source={{ uri: book.imageUrl }} className="w-full h-56 mb-4 rounded-lg" resizeMode="contain" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text className="text-center text-lg mt-5 text-white">No books available</Text>
        )}

        <Modal visible={descriptionModalVisible} transparent={true} animationType="slide">
          <View className="flex-1 justify-end bg-[#161622] bg-opacity-50">
            <View className="bg-white rounded-t-lg pt-10 pb-4 px-4">
              <TouchableOpacity 
                onPress={() => setDescriptionModalVisible(false)} 
                className="absolute left-4 top-12 p-2 bg-gray-200 rounded-full"
              >
                <Text className="text-[#ff8e01] font-bold">Close</Text>
              </TouchableOpacity>
              {selectedBook && (
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="mt-10">
                  <View className="p-4">
                    <Image source={{ uri: selectedBook.imageUrl }} className="w-full h-80 rounded-lg mb-2" resizeMode="contain" />
                    <Text className="text-lg font-bold mb-2">{selectedBook.title}</Text>
                    <Text className="text-sm text-gray-700 mb-1">Author: {selectedBook.author}</Text>
                    <Text className="text-sm text-gray-700 mb-1">ISBN: {selectedBook.isbn}</Text>
                    <View className={`mt-2 p-2 rounded ${selectedBook.available ? 'bg-green-600' : 'bg-red-600'}`}>
                      <Text className="text-white font-bold">{selectedBook.available ? 'Available' : 'Not Available'}</Text>
                    </View>
                    <Text className="text-sm text-gray-700 mt-2 text-justify">{selectedBook.description}</Text>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
