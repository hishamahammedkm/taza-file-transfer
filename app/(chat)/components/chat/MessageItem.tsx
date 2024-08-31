import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { ChatMessageInterface } from 'interfaces/chat';
import { LinearGradient } from 'expo-linear-gradient';

const MessageItem: React.FC<{
  isOwnMessage: boolean;
  isGroupChatMessage: boolean;
  message: ChatMessageInterface;
  deleteChatMessage: (message: ChatMessageInterface) => Promise<void>;
}> = ({ message, isOwnMessage, isGroupChatMessage, deleteChatMessage }) => {
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const [showDeleteOption, setShowDeleteOption] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleDeleteMessage = () => {
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
              setShowDeleteOption(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete message. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className={`mb-6 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
      <View className={`max-w-[85%] flex-row items-end ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
        <Image
          source={{ uri: message.sender?.avatar?.url }}
          className="h-10 w-10 rounded-full border-2 border-white shadow-sm"
        />
        <View
          className={`mx-2 rounded-lg p-3 shadow-md ${isOwnMessage ? 'bg-indigo-50' : 'bg-white'}`}>
          {isGroupChatMessage && !isOwnMessage && (
            <Text className="mb-1 text-xs font-semibold text-gray-600">
              {message.sender?.username}
            </Text>
          )}

          {message.content && (
            <Text className="text-base font-normal leading-6 text-gray-800">{message.content}</Text>
          )}

          {message.attachments?.length > 0 && (
            <View className="mt-3 flex-row flex-wrap">
              {message.attachments.map((file) => (
                <TouchableOpacity
                  key={file._id}
                  onPress={() => setResizedImage(file.url)}
                  className="m-1 h-20 w-20 overflow-hidden rounded-md shadow-sm">
                  <Image source={{ uri: file.url }} className="h-full w-full" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text className="mt-2 text-right text-xs text-gray-500">
            {moment(message.createdAt).format('HH:mm')}
          </Text>
        </View>
      </View>

      {isOwnMessage && (
        <TouchableOpacity
          onPress={() => setShowDeleteOption(!showDeleteOption)}
          className="mt-1 p-2">
          <Ionicons name="ellipsis-horizontal" size={20} color="#6366f1" />
        </TouchableOpacity>
      )}

      {showDeleteOption && isOwnMessage && (
        <TouchableOpacity
          onPress={handleDeleteMessage}
          className="mt-1 rounded-full bg-red-100 px-4 py-2 shadow-sm">
          <Text className="font-medium text-red-600">Delete</Text>
        </TouchableOpacity>
      )}

      <Modal visible={!!resizedImage} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/90">
          <TouchableOpacity
            onPress={() => setResizedImage(null)}
            className="absolute right-4 top-4 z-10">
            <Ionicons name="close-circle" size={36} color="white" />
          </TouchableOpacity>
          <Image
            source={{ uri: resizedImage || '' }}
            className="h-full w-full"
            resizeMode="contain"
          />
        </View>
      </Modal>
    </Animated.View>
  );
};

export default MessageItem;
