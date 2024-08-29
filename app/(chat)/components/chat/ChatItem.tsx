import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { deleteOneOnOneChat } from '../../api';
import { ChatListItemInterface } from 'interfaces/chat';

import GroupChatDetailsModal from './GroupChatDetailsModal';
import { getChatObjectMetadata, requestHandler } from '../../lib';
import { useAuth } from '~/providers/AuthProvider';

const ChatItem: React.FC<{
  chat: ChatListItemInterface;
  onClick: (chat: ChatListItemInterface) => void;
  isActive?: boolean;
  unreadCount?: number;
  onChatDelete: (chatId: string) => void;
}> = ({ chat, onClick, isActive, unreadCount = 0, onChatDelete }) => {
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
        className={`my-2 flex-row items-start justify-between rounded-3xl p-4 ${
          isActive
            ? 'border-taza-orange bg-taza-red border'
            : unreadCount > 0
              ? 'border-taza-orange bg-taza-light border font-bold'
              : 'bg-white'
        }`}>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            setOpenOptions(!openOptions);
          }}
          className="relative self-center p-1">
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
          {openOptions && (
            <View className="border-taza-orange absolute bottom-0 left-0 z-20 translate-y-full rounded-2xl border bg-white p-2 shadow">
              {chat.isGroupChat ? (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setOpenGroupInfo(true);
                  }}
                  className="w-52 flex-row items-center rounded-lg p-4">
                  <Ionicons name="information-circle-outline" size={16} color="#FF4D4F" />
                  <Text className="text-taza-red ml-2">About group</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    Alert.alert('Delete Chat', 'Are you sure you want to delete this chat?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'OK', onPress: () => deleteChat() },
                    ]);
                  }}
                  className="w-52 flex-row items-center rounded-lg p-4">
                  <Ionicons name="trash-outline" size={16} color="#FF4D4F" />
                  <Text className="text-taza-red ml-2">Delete chat</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </TouchableOpacity>
        <View className="flex-shrink-0 flex-row items-center justify-center">
          {chat.isGroupChat ? (
            <View className="relative h-12 w-12 flex-shrink-0 flex-row flex-nowrap items-center justify-start">
              {chat.participants.slice(0, 3).map((participant, i) => (
                <Image
                  key={participant._id}
                  source={{ uri: participant.avatar.url }}
                  className={`absolute h-8 w-8 rounded-full border border-white ${
                    i === 0 ? 'left-0 z-30' : i === 1 ? 'left-2.5 z-20' : 'left-5 z-10'
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
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-taza-dark font-semibold" numberOfLines={1}>
            {getChatObjectMetadata(chat, user!).title}
          </Text>
          <View className="flex-row items-center">
            {chat.lastMessage && chat.lastMessage.attachments.length > 0 && (
              <Ionicons name="attach" size={12} color="#FF9F1C" className="mr-2" />
            )}
            <Text className="text-taza-orange text-sm" numberOfLines={1}>
              {getChatObjectMetadata(chat, user!).lastMessage}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-taza-orange mb-2 text-sm">
            {moment(chat.updatedAt).add('TIME_ZONE', 'hours').fromNow(true)}
          </Text>
          {unreadCount > 0 && (
            <View className="bg-taza-orange h-5 w-5 items-center justify-center rounded-full">
              <Text className="text-xs text-white">{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </>
  );
};

export default ChatItem;
