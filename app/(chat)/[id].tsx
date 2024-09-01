import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PaperAirplaneIcon, PaperClipIcon, XCircleIcon } from 'react-native-heroicons/solid';
import * as ImagePicker from 'expo-image-picker';
import { ExpoSecureStoreAdapter } from '~/utils/supabase';
import { ChatListItemInterface, ChatMessageInterface } from 'interfaces/chat';
import { getChatObjectMetadata, requestHandler } from './lib/index';
import { deleteMessage, getChatMessages, sendMessage } from './api';
import MessageItem from './components/chat/MessageItem';
import Typing from './components/chat/Typing';
import { useSocket } from '~/providers/SocketContext';
import { useAuth } from '~/providers/AuthProvider';
import { LinearGradient } from 'expo-linear-gradient';

const ChatDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [currentChat, setCurrentChat] = useState<ChatListItemInterface | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messages, setMessages] = useState<ChatMessageInterface[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selfTyping, setSelfTyping] = useState(false);
  const [message, setMessage] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getMessages = async () => {
    if (!currentChat?._id) return alert('No chat is selected');
    if (!socket) return alert('Socket not available');

    socket.emit('joinChat', currentChat._id);

    requestHandler(
      async () => await getChatMessages(currentChat._id || ''),
      setLoadingMessages,
      (res) => {
        const { data } = res;
        setMessages(data || []);
      },
      alert
    );
  };

  const sendChatMessage = async () => {
    if (!currentChat?._id || !socket) return;
    socket.emit('stopTyping', currentChat._id);

    await requestHandler(
      async () => await sendMessage(currentChat._id || '', message, attachedFiles),
      null,
      (res) => {
        setMessage('');
        setAttachedFiles([]);
        setMessages((prev) => [res.data, ...prev]);
      },
      alert
    );
  };

  const deleteChatMessage = async (message: ChatMessageInterface) => {
    try {
      await requestHandler(
        async () => await deleteMessage(message.chat, message._id),
        null,
        (res) => {
          setMessages((prev) => prev.filter((msg) => msg._id !== res.data._id));

        },
        (error) => {
          console.error('Error deleting message:', error);
          throw error; // Re-throw the error to be caught in the MessageItem component
        }
      );
    } catch (error) {
      console.error('Error in deleteChatMessage:', error);
      throw error; // Re-throw the error to be caught in the MessageItem component
    }
  };

  const handleOnMessageChange = (text: string) => {
    setMessage(text);

    if (!socket || !socket.connected) return;

    if (!selfTyping) {
      setSelfTyping(true);
      socket.emit('typing', currentChat?._id);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const timerLength = 3000;

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', currentChat?._id);
      setSelfTyping(false);
    }, timerLength);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setAttachedFiles([...attachedFiles, result.assets[0]]);
    }
  };

  useEffect(() => {
    ExpoSecureStoreAdapter.getItem('currentChat').then((value: any) => {
      if (value) {
        const _currentChat = JSON.parse(value);
        setCurrentChat(_currentChat);
      }
    });
  }, []);

  useEffect(() => {
    if (currentChat) {
      getMessages();
    }
  }, [currentChat]);

  useEffect(() => {
    if (!socket) return;

    const onTyping = (chatId: string) => {
      if (chatId !== currentChat?._id) return;
      setIsTyping(true);
    };

    const onStopTyping = (chatId: string) => {
      if (chatId !== currentChat?._id) return;
      setIsTyping(false);
    };

    const onMessageReceived = (message: ChatMessageInterface) => {
      if (message?.chat !== currentChat?._id) return;
      setMessages((prev) => [message, ...prev]);
    };

    const onMessageDelete = (message: ChatMessageInterface) => {
      if (message?.chat !== currentChat?._id) return;
      setMessages((prev) => prev.filter((msg) => msg._id !== message._id));
    };

    socket.on('typing', onTyping);
    socket.on('stopTyping', onStopTyping);
    socket.on('messageReceived', onMessageReceived);
    socket.on('messageDeleted', onMessageDelete);

    return () => {
      socket.off('typing', onTyping);
      socket.off('stopTyping', onStopTyping);
      socket.off('messageReceived', onMessageReceived);
      socket.off('messageDeleted', onMessageDelete);
    };
  }, [socket, currentChat]);

  const { width } = useWindowDimensions();
  const isTablet = width > 768;
  if (!currentChat) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-taza-dark">Loading chat...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <View className="flex-1">
          <View className="sticky top-0 z-20 w-full flex-row items-center justify-between bg-white bg-opacity-90 p-4 shadow-md">
            <View className="flex-row items-center">
              {currentChat.isGroupChat ? (
                <View className="relative h-12 w-12 flex-shrink-0 flex-row items-center justify-start">
                  {currentChat.participants.slice(0, 3).map((participant, i) => (
                    <Image
                      key={participant._id}
                      source={{ uri: participant.avatar.url }}
                      className="absolute h-9 w-9 rounded-full border-2 border-white"
                      style={{ left: i * 8, zIndex: 3 - i }}
                    />
                  ))}
                </View>
              ) : (
                <Image
                  className="h-14 w-14 flex-shrink-0 rounded-full border-2 border-white"
                  source={{ uri: getChatObjectMetadata(currentChat, user!).avatar }}
                />
              )}
              <View className="ml-3">
                <Text className="text-lg font-bold text-gray-800">
                  {getChatObjectMetadata(currentChat, user!).title}
                </Text>
                <Text className="text-sm text-gray-600">
                  {getChatObjectMetadata(currentChat, user!).description}
                </Text>
              </View>
            </View>
          </View>

          <FlatList
            inverted
            className={`p-4 ${isTablet ? 'px-16' : ''}`}
            data={messages}
            renderItem={({ item: msg }) => (
              <MessageItem
                isGroupChatMessage={currentChat?.isGroupChat}
                message={msg}
                isOwnMessage={msg.sender?._id === user?._id}
                deleteChatMessage={deleteChatMessage}
              />
            )}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={isTyping ? <Typing /> : null}
          />

          {attachedFiles.length > 0 && (
            <ScrollView horizontal className={`p-4 ${isTablet ? 'px-16' : ''}`}>
              {attachedFiles.map((file, i) => (
                <View key={i} className="relative mr-2 h-32 w-32 overflow-hidden rounded-xl">
                  <TouchableOpacity
                    className="absolute right-1 top-1 z-10"
                    onPress={() => {
                      setAttachedFiles(attachedFiles.filter((_, ind) => ind !== i));
                    }}>
                    <XCircleIcon color="white" size={24} />
                  </TouchableOpacity>
                  <Image className="h-full w-full rounded-xl" source={{ uri: file.uri }} />
                </View>
              ))}
            </ScrollView>
          )}

          <View
            className={`w-full flex-row items-center justify-between bg-white bg-opacity-90 p-4 ${isTablet ? 'px-16' : ''}`}>
            <TextInput
              placeholder="Message"
              value={message}
              onChangeText={handleOnMessageChange}
              className="mr-2 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-800"
            />
            <TouchableOpacity
              onPress={sendChatMessage}
              disabled={!message && attachedFiles.length <= 0}
              className={`rounded-lg bg-indigo-600 p-3 ${!message && attachedFiles.length <= 0 ? 'opacity-50' : ''}`}>
              <PaperAirplaneIcon color="white" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default ChatDetailsScreen;
