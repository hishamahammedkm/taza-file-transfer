import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Switch,
  Alert,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { createGroupChat, createUserChat, getAvailableUsers } from '../../api';
import { ChatListItemInterface } from 'interfaces/chat';
import { UserInterface } from 'interfaces/user';
import { requestHandler } from '../../lib';
import UserSelectionModal from '../UserSelectionModal';

const AddChatModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSuccess: (chat: ChatListItemInterface) => void;
}> = ({ visible, onClose, onSuccess }) => {
  const [users, setUsers] = useState<UserInterface[]>([]);
  const [groupName, setGroupName] = useState('');
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupParticipants, setGroupParticipants] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<null | string>(null);
  const [creatingChat, setCreatingChat] = useState(false);
  const [isUserSelectionModalVisible, setIsUserSelectionModalVisible] = useState(false);
  const { width } = useWindowDimensions();
  const isTablet = width > 768;

  const getUsers = async () => {
    requestHandler(
      async () => await getAvailableUsers(),
      null,
      (res) => {
        const { data } = res;
        setUsers(data || []);
      },
      (error) => Alert.alert('Error', 'Failed to fetch users')
    );
  };

  const createNewChat = async () => {
    if (!selectedUserId) return Alert.alert('Error', 'Please select a user');

    await requestHandler(
      async () => await createUserChat(selectedUserId),
      setCreatingChat,
      (res) => {
        const { data } = res;
        if (res.statusCode === 200) {
          Alert.alert('Info', 'Chat with selected user already exists');
          return;
        }
        onSuccess(data);
        handleClose();
      },
      (error) => Alert.alert('Error', 'Failed to create chat')
    );
  };

  const createNewGroupChat = async () => {
    if (!groupName) return Alert.alert('Error', 'Group name is required');
    if (!groupParticipants.length || groupParticipants.length < 2)
      return Alert.alert('Error', 'There must be at least 2 group participants');

    await requestHandler(
      async () =>
        await createGroupChat({
          name: groupName,
          participants: groupParticipants,
        }),
      setCreatingChat,
      (res) => {
        const { data } = res;
        onSuccess(data);
        handleClose();
      },
      (error) => Alert.alert('Error', 'Failed to create group chat')
    );
  };

  const handleClose = () => {
    setUsers([]);
    setSelectedUserId(null);
    setGroupName('');
    setGroupParticipants([]);
    setIsGroupChat(false);
    onClose();
  };

  const handleUserSelect = (userId: string) => {
    if (isGroupChat) {
      if (groupParticipants.includes(userId)) {
        setGroupParticipants(groupParticipants.filter((id) => id !== userId));
      } else {
        setGroupParticipants([...groupParticipants, userId]);
      }
    } else {
      setSelectedUserId(userId);
      setIsUserSelectionModalVisible(false);
    }
  };

  useEffect(() => {
    if (!visible) return;
    getUsers();
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} className="flex-1">
        <ScrollView>
          <View className={`flex-1  justify-center p-8 ${isTablet ? 'px-16' : ''}`}>
            <View className="rounded-3xl bg-white bg-opacity-90 p-8 shadow-lg">
              <View className="mb-8 items-center">
                <Text className="text-3xl font-bold text-gray-800">
                  {isGroupChat ? 'Create Group Chat' : 'Create Chat'}
                </Text>
              </View>

              <View className="mb-6 flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-gray-700">Group Chat</Text>
                <Switch
                  value={isGroupChat}
                  onValueChange={setIsGroupChat}
                  trackColor={{ false: '#767577', true: '#4c669f' }}
                  thumbColor={isGroupChat ? '#3b5998' : '#f4f3f4'}
                />
              </View>

              {isGroupChat && (
                <View className="mb-4">
                  <View className="flex-row items-center rounded-lg border border-gray-300 px-3 py-2">
                    <Ionicons name="people-outline" size={24} color="#666" className="mr-2" />
                    <TextInput
                      className="flex-1 text-base"
                      placeholder="Group Name"
                      placeholderTextColor="#999"
                      value={groupName}
                      onChangeText={setGroupName}
                    />
                  </View>
                </View>
              )}

              <View className="mb-4">
                <TouchableOpacity
                  className="flex-row items-center rounded-lg border border-gray-300 px-3 py-2"
                  onPress={() => setIsUserSelectionModalVisible(true)}>
                  <Ionicons name="person-outline" size={24} color="#666" className="mr-2" />
                  <Text className="flex-1 text-base text-gray-700">
                    {isGroupChat
                      ? `${groupParticipants.length} participant${
                          groupParticipants.length !== 1 ? 's' : ''
                        } selected`
                      : selectedUserId
                        ? users.find((u) => u._id === selectedUserId)?.username
                        : 'Select a user'}
                  </Text>
                  <Ionicons name="chevron-down-outline" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {isGroupChat && groupParticipants.length > 0 && (
                <View className="mb-4">
                  <Text className="mb-2 font-semibold text-gray-700">Selected Participants:</Text>
                  <View className="flex-row flex-wrap">
                    {users
                      .filter((user) => groupParticipants.includes(user._id))
                      .map((participant) => (
                        <View
                          key={participant._id}
                          className="m-1 flex-row items-center rounded-full bg-gray-200 p-2">
                          <Image
                            source={{ uri: participant.avatar.url }}
                            className="h-6 w-6 rounded-full"
                          />
                          <Text className="mx-2 text-gray-800">{participant.username}</Text>
                          <TouchableOpacity onPress={() => handleUserSelect(participant._id)}>
                            <Ionicons name="close-circle" size={24} color="#FF4D4F" />
                          </TouchableOpacity>
                        </View>
                      ))}
                  </View>
                </View>
              )}

              <TouchableOpacity
                className={`items-center rounded-lg bg-indigo-600 py-3 shadow-md ${
                  creatingChat ? 'opacity-70' : ''
                }`}
                onPress={isGroupChat ? createNewGroupChat : createNewChat}
                disabled={creatingChat}>
                <Text className="text-lg font-bold text-white">
                  {creatingChat ? 'Creating...' : 'Create Chat'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="mt-4 items-center rounded-lg border border-indigo-600 py-3"
                onPress={handleClose}>
                <Text className="text-lg font-bold text-indigo-600">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>

      <UserSelectionModal
        visible={isUserSelectionModalVisible}
        onClose={() => setIsUserSelectionModalVisible(false)}
        onSelect={handleUserSelect}
        users={users}
        isGroupChat={isGroupChat}
        selectedUsers={isGroupChat ? groupParticipants : selectedUserId ? [selectedUserId] : []}
      />
    </Modal>
  );
};

export default AddChatModal;
