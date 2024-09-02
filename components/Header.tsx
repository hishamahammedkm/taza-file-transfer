import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '~/providers/AuthProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '~/utils/supabase';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const route = useRoute();
  const { width } = useWindowDimensions();
  const { user, logOut } = useAuth();


  const insets = useSafeAreaInsets();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  const isTablet = width > 768;
  const isChatScreen = route.name === '(chat)';

  useEffect(() => {
    if (isMenuVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isMenuVisible, fadeAnim]);

  const handleBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    await logOut();
    // setIsMenuVisible(false);
    // Implement your signOut logic here
  };

  const toggleMenu = (event: any) => {
    const { pageY, pageX } = event.nativeEvent;
    setMenuPosition({ top: pageY + 10, right: width - pageX });
    setIsMenuVisible(!isMenuVisible);
  };

  const handleUploadOrChat = () => {
    if (isChatScreen) {
      router.push('/postInvoice');
    } else {
      router.push('/(chat)');
    }
  };

  return (
    <>
      <View
        className={`bg-indigo-700 ${isTablet ? 'pb-4' : 'pb-2.5'}`}
        style={{ paddingTop: insets.top }}>
        <StatusBar barStyle="light-content" backgroundColor="#4338ca" />
        <View
          className={`flex-row items-center justify-between px-4 ${isTablet ? 'h-16' : 'h-14'}`}>
          {isChatScreen && (
            <TouchableOpacity onPress={handleBack} className="p-2">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          <View></View>

          {/* <Text
            className={`flex-1  text-center font-bold text-white ${isTablet ? 'text-xl' : 'text-lg'}`}>
            {title}
          </Text> */}

          <View className="flex-row">
            {!isChatScreen && (
              <TouchableOpacity onPress={handleUploadOrChat} className="ml-2 p-2">
                <Ionicons
                  name={isChatScreen ? 'cloud-upload-outline' : 'chatbubbles-outline'}
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={toggleMenu} className="ml-2 p-2">
              <Ionicons name="person-circle-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {isMenuVisible && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsMenuVisible(false)}
          className="absolute bottom-0 left-0 right-0 top-0 z-40"
        />
      )}

      <Animated.View
        className="absolute z-50 rounded-lg bg-white shadow-lg"
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
          display: isMenuVisible ? 'flex' : 'none',
          width: isTablet ? 300 : 250,
          top: menuPosition.top,
          right: menuPosition.right,
        }}>
        <View className="border-b border-gray-200 p-4">
          <Text className="text-lg font-semibold">{user?.username || 'User'}</Text>
          <Text className="text-sm text-gray-600">{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} className="flex-row items-center p-4">
          <Ionicons name="log-out-outline" size={24} color="#4338ca" />
          <Text className="ml-2 font-semibold text-indigo-700">Log out</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

export default Header;
