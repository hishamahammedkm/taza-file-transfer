import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '~/providers/AuthProvider';
import { ChatListItemInterface } from 'interfaces/chat';
import { getChatObjectMetadata, requestHandler } from './lib/index';
import { getUserChats } from './api';
import AddChatModal from './components/chat/AddChatModal';
import ChatItem from './components/chat/ChatItem';
import Typing from './components/chat/Typing';
import { useSocket } from '~/providers/SocketContext';
import { ExpoSecureStoreAdapter } from '~/utils/supabase';

const ChatListScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [openAddChat, setOpenAddChat] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [chats, setChats] = useState<ChatListItemInterface[]>([]);
  const [localSearchQuery, setLocalSearchQuery] = useState('');

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

    socket.on('newChat', onNewChat);
    socket.on('leaveChat', onChatLeave);
    socket.on('updateGroupName', onGroupNameChange);

    return () => {
      socket.off('newChat', onNewChat);
      socket.off('leaveChat', onChatLeave);
      socket.off('updateGroupName', onGroupNameChange);
    };
  }, [socket, chats]);

  return (
    <View className="flex-1 bg-white">
      <AddChatModal
        visible={openAddChat}
        onClose={() => {
          setOpenAddChat(false);
        }}
        onSuccess={() => {
          getChats();
        }}
      />

      <View className="sticky top-0 z-10 flex-row items-center justify-between bg-white px-4 py-4">
        <TextInput
          placeholder="Search user or group..."
          value={localSearchQuery}
          onChangeText={(text) => setLocalSearchQuery(text.toLowerCase())}
          className="mr-2 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-taza-dark"
        />
        <TouchableOpacity
          onPress={() => setOpenAddChat(true)}
          className="rounded-xl bg-taza-orange px-3 py-2">
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
              unreadCount={0}
              onClick={(chat) => {
                ExpoSecureStoreAdapter.setItem('currentChat', JSON.stringify(chat));
                router.push(`/(chat)/${chat._id}`);
              }}
              onChatDelete={(chatId) => {
                setChats((prev) => prev.filter((chat) => chat._id !== chatId));
              }}
            />
          )}
          keyExtractor={(item) => item._id}
        />
      )}
    </View>
  );
};

export default ChatListScreen;
