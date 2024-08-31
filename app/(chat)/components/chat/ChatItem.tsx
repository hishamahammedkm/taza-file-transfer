import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { deleteOneOnOneChat } from '../../api';
import { ChatListItemInterface } from 'interfaces/chat';
import GroupChatDetailsModal from './GroupChatDetailsModal';
import { getChatObjectMetadata, requestHandler } from '../../lib';
import { useAuth } from '~/providers/AuthProvider';

interface ChatItemProps {
  chat: ChatListItemInterface;
  onClick: (chat: ChatListItemInterface) => void;
  isActive?: boolean;
  unreadCount?: number;
  onChatDelete: (chatId: string) => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  chat,
  onClick,
  isActive,
  unreadCount = 0,
  onChatDelete,
}) => {
  const { user } = useAuth();
  const [openOptions, setOpenOptions] = useState(false);
  const [openGroupInfo, setOpenGroupInfo] = useState(false);

  const deleteChat = async () => {
    await requestHandler(
      async () => await deleteOneOnOneChat(chat._id),
      null,
      () => {
        onChatDelete(chat._id);
      },
      (error) => Alert.alert('Error')
    );
  };

  if (!chat) return null;

  return (
    <>
      <GroupChatDetailsModal
        visible={openGroupInfo}
        onClose={() => setOpenGroupInfo(false)}
        chatId={chat._id}
        onGroupDelete={onChatDelete}
      />
      <TouchableOpacity
        onPress={() => onClick(chat)}
        className={`mb-2 flex-row items-center justify-between rounded-lg p-3 ${
          isActive ? 'bg-indigo-100' : unreadCount > 0 ? 'bg-gray-100' : 'bg-white'
        }`}>
        <View className="flex-1 flex-row items-center">
          <View className="relative mr-3">
            {chat.isGroupChat ? (
              <View className="relative h-12 w-12 flex-row items-center justify-start">
                {chat.participants.slice(0, 3).map((participant, i) => (
                  <Image
                    key={participant._id}
                    source={{ uri: participant.avatar.url }}
                    className={`absolute h-8 w-8 rounded-full border-2 border-white ${
                      i === 0 ? 'left-0 z-30' : i === 1 ? 'left-3 z-20' : 'left-6 z-10'
                    }`}
                  />
                ))}
              </View>
            ) : (
              <Image
                source={{ uri: getChatObjectMetadata(chat, user!).avatar }}
                className="h-12 w-12 rounded-full"
              />
            )}
            {unreadCount > 0 && (
              <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-indigo-600">
                <Text className="text-xs font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-800" numberOfLines={1}>
              {getChatObjectMetadata(chat, user!).title}
            </Text>
            <View className="flex-row items-center">
              {chat.lastMessage && chat.lastMessage.attachments.length > 0 && (
                <Ionicons name="attach" size={12} color="#4B5563" className="mr-1" />
              )}
              <Text className="text-sm text-gray-500" numberOfLines={1}>
                {getChatObjectMetadata(chat, user!).lastMessage}
              </Text>
            </View>
          </View>
        </View>
        <View className="ml-2 items-end">
          <Text className="mb-1 text-xs text-gray-400">
            {moment(chat.updatedAt).add('TIME_ZONE', 'hours').fromNow(true)}
          </Text>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              setOpenOptions(!openOptions);
            }}
            className="p-1">
            <Ionicons name="ellipsis-vertical" size={16} color="#4B5563" />
          </TouchableOpacity>
        </View>
        {openOptions && (
          <View className="absolute right-0 top-full z-10 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg">
            {chat.isGroupChat ? (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  setOpenGroupInfo(true);
                  setOpenOptions(false);
                }}
                className="flex-row items-center px-4 py-2">
                <Ionicons name="information-circle-outline" size={16} color="#4B5563" />
                <Text className="ml-2 text-gray-700">About group</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  Alert.alert('Delete Chat', 'Are you sure you want to delete this chat?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', onPress: () => deleteChat(), style: 'destructive' },
                  ]);
                  setOpenOptions(false);
                }}
                className="flex-row items-center px-4 py-2">
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text className="ml-2 text-red-500">Delete chat</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    </>
  );
};

export default ChatItem;
