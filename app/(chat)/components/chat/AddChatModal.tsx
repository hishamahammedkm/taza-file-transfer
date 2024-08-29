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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createGroupChat, createUserChat, getAvailableUsers } from '../../api';
import { ChatListItemInterface } from 'interfaces/chat';
import { UserInterface } from 'interfaces/user';

import Button from '../Button';
import Input from '../Input';
import Select from '../Select';
import { requestHandler } from '../../lib';

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

  const getUsers = async () => {
    requestHandler(
      async () => await getAvailableUsers(),
      null,
      (res) => {
        const { data } = res;
        console.log('data--users', data);

        setUsers(data || []);
      },
      (error) => Alert.alert('Error')
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
      (error) => Alert.alert('Error')
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
      (error) => Alert.alert('Error')
    );
  };

  const handleClose = () => {
    setUsers([]);
    setSelectedUserId('');
    setGroupName('');
    setGroupParticipants([]);
    setIsGroupChat(false);
    onClose();
  };

  useEffect(() => {
    if (!visible) return;
    getUsers();
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <View className="flex-1 justify-end">
        <View className="bg-taza-red h-5/6 rounded-t-lg p-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-white">Create chat</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#FFF0E0" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View className="my-5 flex-row items-center">
              <Switch
                value={isGroupChat}
                onValueChange={setIsGroupChat}
                trackColor={{ false: '#FFF0E0', true: '#FF9F1C' }}
                thumbColor={isGroupChat ? '#FFFFFF' : '#FF4D4F'}
              />
              <Text className={`ml-3 text-white ${isGroupChat ? '' : 'opacity-60'}`}>
                Is it a group chat?
              </Text>
            </View>

            {isGroupChat && (
              <View className="my-5">
                <Input
                  placeholder="Enter a group name..."
                  value={groupName}
                  onChangeText={setGroupName}
                />
              </View>
            )}

            <View className="my-5">
              <Select
                placeholder={
                  isGroupChat ? 'Select group participants...' : 'Select a user to chat...'
                }
                value={isGroupChat ? '' : selectedUserId || ''}
                options={users.map((user) => ({
                  label: user.username,
                  value: user._id,
                }))}
                onChange={({ value }) => {
                  if (isGroupChat && !groupParticipants.includes(value)) {
                    setGroupParticipants([...groupParticipants, value]);
                  } else {
                    setSelectedUserId(value);
                  }
                }}
              />
            </View>

            {isGroupChat && (
              <View className="my-5">
                <View className="flex-row items-center">
                  <Ionicons name="people" size={20} color="#FF9F1C" />
                  <Text className="ml-2 font-medium text-white">Selected participants</Text>
                </View>
                <View className="mt-3 flex-row flex-wrap">
                  {users
                    .filter((user) => groupParticipants.includes(user._id))
                    .map((participant) => (
                      <View
                        key={participant._id}
                        className="bg-taza-light border-taza-orange m-1 flex-row items-center rounded-full border p-2">
                        <Image
                          source={{ uri: participant.avatar.url }}
                          className="h-6 w-6 rounded-full"
                        />
                        <Text className="text-taza-dark mx-2">{participant.username}</Text>
                        <TouchableOpacity
                          onPress={() => {
                            setGroupParticipants(
                              groupParticipants.filter((p) => p !== participant._id)
                            );
                          }}>
                          <Ionicons name="close-circle" size={24} color="#FF4D4F" />
                        </TouchableOpacity>
                      </View>
                    ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View className="mt-5 flex-row justify-between">
            <Button
              disabled={creatingChat}
              onPress={handleClose}
              className="bg-taza-light mr-2 flex-1">
              Close
            </Button>

            <Button
              disabled={creatingChat}
              onPress={isGroupChat ? createNewGroupChat : createNewChat}
              className="bg-taza-orange ml-2 flex-1">
              Create
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddChatModal;
