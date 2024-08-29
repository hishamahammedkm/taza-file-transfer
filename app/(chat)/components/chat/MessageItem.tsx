import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { ChatMessageInterface } from 'interfaces/chat';

const MessageItem: React.FC<{
  isOwnMessage?: boolean;
  isGroupChatMessage?: boolean;
  message: ChatMessageInterface;
  deleteChatMessage: (message: ChatMessageInterface) => void;
}> = ({ message, isOwnMessage, isGroupChatMessage, deleteChatMessage }) => {
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const [openOptions, setOpenOptions] = useState<boolean>(false);

  const handleDeleteMessage = () => {
    Alert.alert('Delete Message', 'Are you sure you want to delete this message?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', onPress: () => deleteChatMessage(message) },
    ]);
  };

  return (
    <>
      <Modal visible={!!resizedImage} transparent={true} animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/70 p-8">
          <TouchableOpacity
            className="absolute right-5 top-5 z-10"
            onPress={() => setResizedImage(null)}>
            <Ionicons name="close" size={36} color="white" />
          </TouchableOpacity>
          <Image
            source={{ uri: resizedImage || '' }}
            className="h-full w-full"
            resizeMode="contain"
          />
        </View>
      </Modal>

      <View
        className={`max-w-lg flex-row items-end gap-3 ${isOwnMessage ? 'self-end' : 'self-start'}`}>
        <Image
          source={{ uri: message.sender?.avatar?.url }}
          className={`h-7 w-7 rounded-full ${isOwnMessage ? 'order-last' : 'order-first'}`}
        />
        <View
          className={`rounded-3xl p-4 ${
            isOwnMessage ? 'bg-taza-red rounded-br-none' : 'bg-taza-orange rounded-bl-none'
          }`}>
          {isGroupChatMessage && !isOwnMessage && (
            <Text
              className={`mb-2 text-xs font-semibold ${
                message.sender.username.length % 2 === 0 ? 'text-taza-red' : 'text-taza-orange'
              }`}>
              {message.sender?.username}
            </Text>
          )}

          {message?.attachments?.length > 0 && (
            <View>
              {isOwnMessage && (
                <TouchableOpacity
                  className="self-center p-1"
                  onPress={() => setOpenOptions(!openOptions)}>
                  <Ionicons name="ellipsis-vertical" size={24} color="#FFF0E0" />
                </TouchableOpacity>
              )}

              <View className={`flex-row flex-wrap ${message.content ? 'mb-6' : ''}`}>
                {message.attachments?.map((file) => (
                  <TouchableOpacity
                    key={file._id}
                    className="relative m-1 aspect-square overflow-hidden rounded-xl"
                    onPress={() => setResizedImage(file.url)}>
                    <Image source={{ uri: file.url }} className="h-full w-full" />
                    <View className="absolute inset-0 items-center justify-center bg-black/60 opacity-0 active:opacity-100">
                      <Ionicons name="search" size={24} color="white" />
                      <TouchableOpacity onPress={() => Linking.openURL(file.url)}>
                        <Ionicons name="download" size={24} color="white" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {message.content && (
            <View className="relative flex-row justify-between">
              {isOwnMessage && (
                <TouchableOpacity
                  className="self-center"
                  onPress={() => setOpenOptions(!openOptions)}>
                  <Ionicons name="ellipsis-vertical" size={16} color="#FFF0E0" />
                </TouchableOpacity>
              )}
              <Text className="text-sm text-white">{message.content}</Text>
            </View>
          )}

          <Text
            className={`mt-1.5 self-end text-xs ${
              isOwnMessage ? 'text-taza-light' : 'text-taza-dark'
            }`}>
            {message.attachments?.length > 0 && (
              <Ionicons name="attach" size={16} color={isOwnMessage ? '#FFF0E0' : '#333333'} />
            )}
            {moment(message.updatedAt).add('TIME_ZONE', 'hours').fromNow(true)} ago
          </Text>
        </View>
      </View>

      {openOptions && (
        <TouchableOpacity
          className="bg-taza-dark border-taza-orange absolute bottom-full right-0 mb-2 rounded-2xl border p-2 shadow"
          onPress={handleDeleteMessage}>
          <View className="flex-row items-center">
            <Ionicons name="trash" size={16} color="#FF4D4F" />
            <Text className="text-taza-red ml-2">Delete Message</Text>
          </View>
        </TouchableOpacity>
      )}
    </>
  );
};

export default MessageItem;
