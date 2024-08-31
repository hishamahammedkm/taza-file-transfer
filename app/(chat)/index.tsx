import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '~/providers/AuthProvider';
import { ChatListItemInterface, ChatMessageInterface } from 'interfaces/chat';
import { getChatObjectMetadata, requestHandler } from './lib/index';
import { getUserChats } from './api';
import AddChatModal from './components/chat/AddChatModal';
import ChatItem from './components/chat/ChatItem';
import Typing from './components/chat/Typing';
import { useSocket } from '~/providers/SocketContext';
import { ExpoSecureStoreAdapter } from '~/utils/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const ChatListScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [openAddChat, setOpenAddChat] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [chats, setChats] = useState<ChatListItemInterface[]>([]);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [unreadMessages, setUnreadMessages] = useState<ChatMessageInterface[]>([]);

  const getChats = async () => {
    requestHandler(
      async () => await getUserChats(),
      setLoadingChats,
      (res) => {
        const { data } = res;
        setChats(data || []);
      },
      alert
    );
  };

  useEffect(() => {
    getChats();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onNewChat = (chat: ChatListItemInterface) => {
      setChats((prev) => [chat, ...prev]);
    };

    const onChatLeave = (chat: ChatListItemInterface) => {
      setChats((prev) => prev.filter((c) => c._id !== chat._id));
    };

    const onGroupNameChange = (chat: ChatListItemInterface) => {
      setChats((prev) => [
        ...prev.map((c) => {
          if (c._id === chat._id) {
            return chat;
          }
          return c;
        }),
      ]);
    };

    const onMessageReceived = (message: ChatMessageInterface) => {
      setUnreadMessages((prev) => [...prev, message]);
    };

    socket.on('newChat', onNewChat);
    socket.on('leaveChat', onChatLeave);
    socket.on('updateGroupName', onGroupNameChange);
    socket.on('messageReceived', onMessageReceived);

    return () => {
      socket.off('newChat', onNewChat);
      socket.off('leaveChat', onChatLeave);
      socket.off('updateGroupName', onGroupNameChange);
      socket.off('messageReceived', onMessageReceived);
    };
  }, [socket, chats]);

  const getUnreadCount = (chatId: string) => {
    return unreadMessages.filter((msg) => msg.chat === chatId).length;
  };

  return (

      <SafeAreaView className="flex-1">
        <View className=" flex-1">
          <View className="flex-1  bg-white bg-opacity-90 p-4 ">
            <AddChatModal
              visible={openAddChat}
              onClose={() => {
                setOpenAddChat(false);
              }}
              onSuccess={() => {
                getChats();
              }}
            />

            <View className="mb-4 flex-row items-center justify-between">
              <View className="mr-2 flex-1 flex-row items-center rounded-lg border border-gray-300 bg-white">
                <Ionicons name="search" size={20} color="#666" style={{ marginLeft: 8 }} />
                <TextInput
                  placeholder="Search user or group..."
                  value={localSearchQuery}
                  onChangeText={(text) => setLocalSearchQuery(text.toLowerCase())}
                  className="flex-1 px-2 py-2 text-gray-700"
                />
              </View>
              <TouchableOpacity
                onPress={() => setOpenAddChat(true)}
                className="rounded-lg bg-indigo-600 px-3 py-2">
                <Text className="font-bold text-white">+ Add chat</Text>
              </TouchableOpacity>
            </View>

            {loadingChats ? (
              <View className="flex-1 items-center justify-center">
                <Typing />
              </View>
            ) : (
              <FlatList
                data={chats.filter((chat) =>
                  localSearchQuery
                    ? getChatObjectMetadata(chat, user!)
                        .title?.toLocaleLowerCase()
                        ?.includes(localSearchQuery)
                    : true
                )}
                renderItem={({ item: chat }) => (
                  <ChatItem
                    chat={chat}
                    isActive={false}
                    unreadCount={getUnreadCount(chat._id)}
                    onClick={(chat) => {
                      ExpoSecureStoreAdapter.setItem('currentChat', JSON.stringify(chat));
                      setUnreadMessages((prev) => prev.filter((msg) => msg.chat !== chat._id));
                      router.push(`/(chat)/${chat._id}`);
                    }}
                    onChatDelete={(chatId) => {
                      setChats((prev) => prev.filter((chat) => chat._id !== chatId));
                      setUnreadMessages((prev) => prev.filter((msg) => msg.chat !== chatId));
                    }}
                  />
                )}
                keyExtractor={(item) => item._id}
                className="flex-1"
              />
            )}
          </View>
        </View>
      </SafeAreaView>

  );
};

export default ChatListScreen;
