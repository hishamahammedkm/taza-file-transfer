import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  addParticipantToGroup,
  deleteGroup,
  getAvailableUsers,
  getGroupInfo,
  removeParticipantFromGroup,
  updateGroupName,
} from '../../api';
import { ChatListItemInterface } from 'interfaces/chat';
import { UserInterface } from 'interfaces/user';

import Button from '../Button'; // Assume this is a custom React Native button component
import Input from '../Input'; // Assume this is a custom React Native input component
import Select from '../Select'; // Assume this is a custom React Native select component
import { useAuth } from '~/providers/AuthProvider';
import { requestHandler } from '../../lib';

const GroupChatDetailsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  chatId: string;
  onGroupDelete: (chatId: string) => void;
}> = ({ visible, onClose, chatId, onGroupDelete }) => {
  const { user } = useAuth();
  const [addingParticipant, setAddingParticipant] = useState(false);
  const [renamingGroup, setRenamingGroup] = useState(false);
  const [participantToBeAdded, setParticipantToBeAdded] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [groupDetails, setGroupDetails] = useState<ChatListItemInterface | null>(null);
  const [users, setUsers] = useState<UserInterface[]>([]);

  const handleGroupNameUpdate = async () => {
    if (!newGroupName) return Alert.alert('Error', 'Group name is required');

    requestHandler(
      async () => await updateGroupName(chatId, newGroupName),
      null,
      (res) => {
        const { data } = res;
        setGroupDetails(data);
        setNewGroupName(data.name);
        setRenamingGroup(false);
        Alert.alert('Success', `Group name updated to ${data.name}`);
      },
      (error) => Alert.alert('Error', 'Sorry')
    );
  };

  const getUsers = async () => {
    requestHandler(
      async () => await getAvailableUsers(),
      null,
      (res) => {
        const { data } = res;
        setUsers(data || []);
      },
      (error) => Alert.alert('Error')
    );
  };

  const deleteGroupChat = async () => {
    if (groupDetails?.admin !== user?._id) {
      return Alert.alert('Error', 'You are not the admin of the group');
    }

    requestHandler(
      async () => await deleteGroup(chatId),
      null,
      () => {
        onGroupDelete(chatId);
        onClose();
      },
      (error) => Alert.alert('Error')
    );
  };

  const removeParticipant = async (participantId: string) => {
    requestHandler(
      async () => await removeParticipantFromGroup(chatId, participantId),
      null,
      () => {
        const updatedGroupDetails = {
          ...groupDetails,
          participants: groupDetails?.participants?.filter((p) => p._id !== participantId) || [],
        };
        setGroupDetails(updatedGroupDetails as ChatListItemInterface);
        Alert.alert('Success', 'Participant removed');
      },
      (error) => Alert.alert('Error')
    );
  };

  const addParticipant = async () => {
    if (!participantToBeAdded) return Alert.alert('Error', 'Please select a participant to add.');

    requestHandler(
      async () => await addParticipantToGroup(chatId, participantToBeAdded),
      null,
      (res) => {
        const { data } = res;
        const updatedGroupDetails = {
          ...groupDetails,
          participants: data?.participants || [],
        };
        setGroupDetails(updatedGroupDetails as ChatListItemInterface);
        Alert.alert('Success', 'Participant added');
      },
      (error) => Alert.alert('Error')
    );
  };

  const fetchGroupInformation = async () => {
    requestHandler(
      async () => await getGroupInfo(chatId),
      null,
      (res) => {
        const { data } = res;
        setGroupDetails(data);
        setNewGroupName(data?.name || '');
      },
      (error) => Alert.alert('Error')
    );
  };

  useEffect(() => {
    if (!visible) return;
    fetchGroupInformation();
    getUsers();
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View className="bg-taza-light flex-1">
        <ScrollView>
          <View className="px-4 pb-4 pt-6">
            <TouchableOpacity onPress={onClose} className="self-end">
              <Ionicons name="close" size={24} color="#FF4D4F" />
            </TouchableOpacity>
          </View>

          <View className="px-4">
            <View className="relative flex-row items-center justify-center">
              {groupDetails?.participants
                .slice(0, 3)
                .map((p, index) => (
                  <Image
                    key={p._id}
                    source={{ uri: p.avatar.url }}
                    className={`absolute h-24 w-24 rounded-full ${
                      index === 0 ? 'left-0' : index === 1 ? 'left-16' : 'left-32'
                    }`}
                  />
                ))}
              {groupDetails?.participants && groupDetails.participants.length > 3 && (
                <Text className="text-taza-red ml-80">+{groupDetails.participants.length - 3}</Text>
              )}
            </View>

            <View className="mt-28 items-center">
              {renamingGroup ? (
                <View className="mt-5 w-full flex-row items-center justify-center space-x-2">
                  <Input
                    placeholder="Enter new group name..."
                    value={newGroupName}
                    onChangeText={setNewGroupName}
                  />
                  <Button onPress={handleGroupNameUpdate}>
                    <Text>Save</Text>
                  </Button>
                  <Button onPress={() => setRenamingGroup(false)}>
                    <Text>Cancel</Text>
                  </Button>
                </View>
              ) : (
                <View className="mt-5 flex-row items-center justify-center">
                  <Text className="text-taza-red text-2xl font-semibold">{groupDetails?.name}</Text>
                  {groupDetails?.admin === user?._id && (
                    <TouchableOpacity onPress={() => setRenamingGroup(true)} className="ml-4">
                      <Ionicons name="pencil" size={20} color="#FF9F1C" />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              <Text className="text-taza-dark mt-2 text-sm">
                Group · {groupDetails?.participants.length} participants
              </Text>
            </View>

            <View className="mt-5">
              <View className="flex-row items-center">
                <Ionicons name="people" size={24} color="#FF4D4F" />
                <Text className="text-taza-red ml-2">
                  {groupDetails?.participants.length} Participants
                </Text>
              </View>

              {groupDetails?.participants?.map((part) => (
                <View key={part._id} className="border-taza-orange border-b py-4">
                  <View className="flex-row items-center">
                    <Image source={{ uri: part.avatar.url }} className="h-12 w-12 rounded-full" />
                    <View className="ml-3">
                      <Text className="text-taza-dark font-semibold">
                        {part.username}
                        {part._id === groupDetails.admin && (
                          <Text className="bg-taza-orange/10 border-taza-orange text-taza-orange ml-2 rounded-full border px-2 text-xs">
                            admin
                          </Text>
                        )}
                      </Text>
                      <Text className="text-taza-dark opacity-60">{part.email}</Text>
                    </View>
                    {groupDetails.admin === user?._id && (
                      <Button
                        onPress={() => {
                          Alert.alert(
                            'Remove Participant',
                            `Are you sure you want to remove ${part.username}?`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'OK', onPress: () => removeParticipant(part._id || '') },
                            ]
                          );
                        }}>
                        <Text>Remove</Text>
                      </Button>
                    )}
                  </View>
                </View>
              ))}

              {groupDetails?.admin === user?._id && (
                <View className="my-5 space-y-4">
                  {!addingParticipant ? (
                    <Button onPress={() => setAddingParticipant(true)}>
                      <Text>ADD </Text>
                    </Button>
                  ) : (
                    <View className="space-y-2">
                      <Select
                        placeholder="Select a user to add..."
                        value={participantToBeAdded}
                        options={users.map((user) => ({ label: user.username, value: user._id }))}
                        onChange={({ value }) => {
                          setParticipantToBeAdded(value);
                        }}
                      />
                      <Button onPress={addParticipant}>Add</Button>
                      <Button
                        onPress={() => {
                          setAddingParticipant(false);
                          setParticipantToBeAdded('');
                        }}>
                        Cancel
                      </Button>
                    </View>
                  )}
                  <Button
                    onPress={() => {
                      Alert.alert('Delete Group', 'Are you sure you want to delete this group?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'OK', onPress: deleteGroupChat },
                      ]);
                    }}>
                    Delete group
                  </Button>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default GroupChatDetailsModal;
