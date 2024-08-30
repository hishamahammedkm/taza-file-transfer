import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { ChatMessageInterface } from 'interfaces/chat';

const MessageItem: React.FC<{
  isOwnMessage: boolean;
  isGroupChatMessage: boolean;
  message: ChatMessageInterface;
  deleteChatMessage: (message: ChatMessageInterface) => Promise<void>;
}> = ({ message, isOwnMessage, isGroupChatMessage, deleteChatMessage }) => {
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const [showDeleteOption, setShowDeleteOption] = useState(false);

  const handleDeleteMessage = () => {
    console.log('Attempting to delete message:', message._id);
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteChatMessage(message);
              console.log('Message deleted successfully');
              setShowDeleteOption(false);
            } catch (error) {
              console.error('Error deleting message:', error);
              Alert.alert('Error', 'Failed to delete message. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View className={`mb-4 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
      <View className={`max-w-[80%] flex-row items-end ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
        <Image
          source={{ uri: message.sender?.avatar?.url }}
          className="h-8 w-8 rounded-full"
        />
        <View
          className={`mx-2 rounded-2xl p-3 ${
            isOwnMessage ? 'bg-taza-red' : 'bg-taza-orange'
          }`}
        >
          {isGroupChatMessage && !isOwnMessage && (
            <Text className="mb-1 text-xs font-bold text-white">
              {message.sender?.username}
            </Text>
          )}
          
          {message.content && (
            <Text className="text-white">{message.content}</Text>
          )}
          
          {message.attachments?.length > 0 && (
            <View className="mt-2 flex-row flex-wrap">
              {message.attachments.map((file) => (
                <TouchableOpacity
                  key={file._id}
                  onPress={() => setResizedImage(file.url)}
                  className="m-1 h-20 w-20 overflow-hidden rounded-lg"
                >
                  <Image source={{ uri: file.url }} className="h-full w-full" />
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          <Text className="mt-1 text-right text-xs text-white">
            {moment(message.createdAt).format('HH:mm')}
          </Text>
        </View>
      </View>
      
      {isOwnMessage && (
        <TouchableOpacity
          onPress={() => setShowDeleteOption(!showDeleteOption)}
          className="mt-1 p-2"
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
        </TouchableOpacity>
      )}
      
      {showDeleteOption && isOwnMessage && (
        <TouchableOpacity
          onPress={handleDeleteMessage}
          className="mt-1 rounded-full bg-red-500 px-3 py-1"
        >
          <Text className="text-white">Delete</Text>
        </TouchableOpacity>
      )}

      <Modal visible={!!resizedImage} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/70">
          <TouchableOpacity
            onPress={() => setResizedImage(null)}
            className="absolute right-4 top-4 z-10"
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <Image
            source={{ uri: resizedImage || '' }}
            className="h-full w-full"
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
};

export default MessageItem;