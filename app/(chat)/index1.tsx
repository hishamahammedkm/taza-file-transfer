import React, { useEffect, useRef, useState } from 'react';
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
} from 'react-native';
import { PaperAirplaneIcon, PaperClipIcon, XCircleIcon } from 'react-native-heroicons/solid';

import * as ImagePicker from 'expo-image-picker';
import { ExpoSecureStoreAdapter, supabase } from '~/utils/supabase';

import { ChatListItemInterface, ChatMessageInterface } from 'interfaces/chat';
import { getChatObjectMetadata, requestHandler } from './lib/index';

import { deleteMessage, getChatMessages, getUserChats, sendMessage } from './api';
import AddChatModal from './components/chat/AddChatModal';
import ChatItem from './components/chat/ChatItem';
import MessageItem from './components/chat/MessageItem';
import Typing from './components/chat/Typing';
import Input from './components/Input';
import { useSocket } from '~/providers/SocketContext';
import { useAuth } from '~/providers/AuthProvider';
import { router } from 'expo-router';

const CONNECTED_EVENT = 'connected';
const DISCONNECT_EVENT = 'disconnect';
const JOIN_CHAT_EVENT = 'joinChat';
const NEW_CHAT_EVENT = 'newChat';
const TYPING_EVENT = 'typing';
const STOP_TYPING_EVENT = 'stopTyping';
const MESSAGE_RECEIVED_EVENT = 'messageReceived';
const LEAVE_CHAT_EVENT = 'leaveChat';
const UPDATE_GROUP_NAME_EVENT = 'updateGroupName';
const MESSAGE_DELETE_EVENT = 'messageDeleted';

const ChatPage = () => {
  const { user, token } = useAuth();
  console.log('user, token--', user, token);

  const { socket } = useSocket();

  const currentChat = useRef<ChatListItemInterface | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [openAddChat, setOpenAddChat] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [chats, setChats] = useState<ChatListItemInterface[]>([]);
  const [messages, setMessages] = useState<ChatMessageInterface[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<ChatMessageInterface[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selfTyping, setSelfTyping] = useState(false);
  const [message, setMessage] = useState('');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);

  const updateChatLastMessage = (chatToUpdateId: string, message: ChatMessageInterface) => {
    const chatToUpdate = chats.find((chat) => chat._id === chatToUpdateId)!;
    chatToUpdate.lastMessage = message;
    chatToUpdate.updatedAt = message?.updatedAt;
    setChats([chatToUpdate, ...chats.filter((chat) => chat._id !== chatToUpdateId)]);
  };

  const updateChatLastMessageOnDeletion = (
    chatToUpdateId: string,
    message: ChatMessageInterface
  ) => {
    const chatToUpdate = chats.find((chat) => chat._id === chatToUpdateId)!;
    if (chatToUpdate.lastMessage?._id === message._id) {
      requestHandler(
        async () => getChatMessages(chatToUpdateId),
        null,
        (req) => {
          const { data } = req;
          chatToUpdate.lastMessage = data[0];
          setChats([...chats]);
        },
        alert
      );
    }
  };

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

  const getMessages = async () => {
    if (!currentChat.current?._id) return alert('No chat is selected');
    if (!socket) return alert('Socket not available');

    socket.emit(JOIN_CHAT_EVENT, currentChat.current?._id);
    setUnreadMessages(unreadMessages.filter((msg) => msg.chat !== currentChat.current?._id));

    requestHandler(
      async () => await getChatMessages(currentChat.current?._id || ''),
      setLoadingMessages,
      (res) => {
        const { data } = res;
        setMessages(data || []);
      },
      alert
    );
  };

  const sendChatMessage = async () => {
    if (!currentChat.current?._id || !socket) return;
    socket.emit(STOP_TYPING_EVENT, currentChat.current?._id);

    await requestHandler(
      async () => await sendMessage(currentChat.current?._id || '', message, attachedFiles),
      null,
      (res) => {
        setMessage('');
        setAttachedFiles([]);
        setMessages((prev) => [res.data, ...prev]);
        updateChatLastMessage(currentChat.current?._id || '', res.data);
      },
      alert
    );
  };



 

 

  const onConnect = () => {
    setIsConnected(true);
  };

  const onDisconnect = () => {
    setIsConnected(false);
  };

  const handleOnSocketTyping = (chatId: string) => {
    if (chatId !== currentChat.current?._id) return;
    setIsTyping(true);
  };

  const handleOnSocketStopTyping = (chatId: string) => {
    if (chatId !== currentChat.current?._id) return;
    setIsTyping(false);
  };

  const onMessageDelete = (message: ChatMessageInterface) => {
    if (message?.chat !== currentChat.current?._id) {
      setUnreadMessages((prev) => prev.filter((msg) => msg._id !== message._id));
    } else {
      setMessages((prev) => prev.filter((msg) => msg._id !== message._id));
    }

    updateChatLastMessageOnDeletion(message.chat, message);
  };

  const onMessageReceived = (message: ChatMessageInterface) => {
    if (message?.chat !== currentChat.current?._id) {
      setUnreadMessages((prev) => [message, ...prev]);
    } else {
      setMessages((prev) => [message, ...prev]);
    }

    updateChatLastMessage(message.chat || '', message);
  };

  const onNewChat = (chat: ChatListItemInterface) => {
    setChats((prev) => [chat, ...prev]);
  };

  const onChatLeave = (chat: ChatListItemInterface) => {
    if (chat._id === currentChat.current?._id) {
      currentChat.current = null;
      ExpoSecureStoreAdapter.removeItem('currentChat');
    }
    setChats((prev) => prev.filter((c) => c._id !== chat._id));
  };

  const onGroupNameChange = (chat: ChatListItemInterface) => {
    if (chat._id === currentChat.current?._id) {
      currentChat.current = chat;
      ExpoSecureStoreAdapter.setItem('currentChat', JSON.stringify(chat));
    }

    setChats((prev) => [
      ...prev.map((c) => {
        if (c._id === chat._id) {
          return chat;
        }
        return c;
      }),
    ]);
  };

  useEffect(() => {
    getChats();
    ExpoSecureStoreAdapter.getItem('currentChat').then((value: any) => {
      if (value) {
        const _currentChat = JSON.parse(value);
        currentChat.current = _currentChat;
        socket?.emit(JOIN_CHAT_EVENT, _currentChat._id);
        getMessages();
      }
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on(CONNECTED_EVENT, onConnect);
    socket.on(DISCONNECT_EVENT, onDisconnect);
    socket.on(TYPING_EVENT, handleOnSocketTyping);
    socket.on(STOP_TYPING_EVENT, handleOnSocketStopTyping);
    socket.on(MESSAGE_RECEIVED_EVENT, onMessageReceived);
    socket.on(NEW_CHAT_EVENT, onNewChat);
    socket.on(LEAVE_CHAT_EVENT, onChatLeave);
    socket.on(UPDATE_GROUP_NAME_EVENT, onGroupNameChange);
    socket.on(MESSAGE_DELETE_EVENT, onMessageDelete);

    return () => {
      socket.off(CONNECTED_EVENT, onConnect);
      socket.off(DISCONNECT_EVENT, onDisconnect);
      socket.off(TYPING_EVENT, handleOnSocketTyping);
      socket.off(STOP_TYPING_EVENT, handleOnSocketStopTyping);
      socket.off(MESSAGE_RECEIVED_EVENT, onMessageReceived);
      socket.off(NEW_CHAT_EVENT, onNewChat);
      socket.off(LEAVE_CHAT_EVENT, onChatLeave);
      socket.off(UPDATE_GROUP_NAME_EVENT, onGroupNameChange);
      socket.off(MESSAGE_DELETE_EVENT, onMessageDelete);
    };
  }, [socket, chats]);

  // return <View></View>;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1">
      <AddChatModal
        visible={openAddChat}
        onClose={() => {
          setOpenAddChat(false);
        }}
        onSuccess={() => {
          getChats();
        }}
      />

      <View className="flex-1 border-r border-taza-orange">
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
                isActive={chat._id === currentChat.current?._id}
                unreadCount={unreadMessages.filter((n) => n.chat === chat._id).length}
                onClick={(chat) => {
                  if (currentChat.current?._id && currentChat.current?._id === chat._id) return;
                  ExpoSecureStoreAdapter.setItem('currentChat', JSON.stringify(chat));
                  currentChat.current = chat;
                  setMessage('');
                  getMessages();

                  router.push({
                    pathname: '/(chat)/[id]',
                    params: { id: chat._id, currentChat: JSON.stringify(currentChat) },
                  });
                }}
                onChatDelete={(chatId) => {
                  setChats((prev) => prev.filter((chat) => chat._id !== chatId));
                  if (currentChat.current?._id === chatId) {
                    currentChat.current = null;
                    ExpoSecureStoreAdapter.removeItem('currentChat');
                  }
                }}
              />
            )}
            keyExtractor={(item) => item._id}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatPage;
