import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

import Button from '../Button';
import Input from '../Input';
import Select from '../Select';
import { useAuth } from '~/providers/AuthProvider';
import { requestHandler } from '../../lib';
import UserSelectionModal from '../UserSelectionModal';

const GroupChatDetailsModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  chatId: string;
  onGroupDelete: (chatId: string) => void;
}> = ({ visible, onClose, chatId, onGroupDelete }) => {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isTablet = width > 768;

  const [addingParticipant, setAddingParticipant] = useState(false);
  const [renamingGroup, setRenamingGroup] = useState(false);
  const [participantToBeAdded, setParticipantToBeAdded] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [groupDetails, setGroupDetails] = useState<ChatListItemInterface | null>(null);
  const [users, setUsers] = useState<UserInterface[]>([]);
  const [isUserSelectionModalVisible, setIsUserSelectionModalVisible] = useState(false);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupParticipants, setGroupParticipants] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<null | string>(null);

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
    if (!selectedUserId) return Alert.alert('Error', 'Please select a participant to add.');

    requestHandler(
      async () => await addParticipantToGroup(chatId, selectedUserId),
      null,
      (res) => {
        const { data } = res;
        const updatedGroupDetails = {
          ...groupDetails,
          participants: data?.participants || [],
        };
        setGroupDetails(updatedGroupDetails as ChatListItemInterface);
        Alert.alert('Success', 'Participant added');
        setAddingParticipant(false);
        setParticipantToBeAdded('');
      },
      (error) => Alert.alert('Error')
    );
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
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}>
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} className="flex-1">
          <ScrollView contentContainerStyle="flex-grow">
            <View className={`flex-1 justify-center p-8 ${isTablet ? 'px-16' : ''}`}>
              <View className="rounded-3xl bg-white bg-opacity-90 p-8 shadow-lg">
                <TouchableOpacity onPress={onClose} className="mb-4 self-end">
                  <Ionicons name="close" size={24} color="#FF4D4F" />
                </TouchableOpacity>

                <View className="mb-8 items-center">
                  <View className="relative mb-4 flex-row items-center justify-center">
                    {groupDetails?.participants
                      .slice(0, 3)
                      .map((p, index) => (
                        <Image
                          key={p._id}
                          source={{ uri: p.avatar.url }}
                          className={`absolute h-16 w-16 rounded-full ${
                            index === 0 ? '-left-8' : index === 1 ? 'left-0' : 'left-8'
                          }`}
                        />
                      ))}
                  </View>
                  {groupDetails?.participants && groupDetails.participants.length > 3 && (
                    <Text className="mt-2 text-indigo-600">
                      +{groupDetails.participants.length - 3}
                    </Text>
                  )}
                  <Text className="mt-4 text-3xl font-bold text-gray-800">
                    {groupDetails?.name}
                  </Text>
                  <Text className="mt-2 text-gray-600">
                    Group · {groupDetails?.participants.length} participants
                  </Text>
                </View>

                {renamingGroup ? (
                  <View className="mb-4">
                    <Input
                      placeholder="Enter new group name..."
                      value={newGroupName}
                      onChangeText={setNewGroupName}
                    />
                    <View className="mt-2 flex-row justify-between">
                      <Button onPress={handleGroupNameUpdate} className="mr-2 flex-1">
                        <Text className="font-bold text-white">Save</Text>
                      </Button>
                      <Button onPress={() => setRenamingGroup(false)} className="ml-2 flex-1">
                        <Text className="font-bold text-white">Cancel</Text>
                      </Button>
                    </View>
                  </View>
                ) : (
                  groupDetails?.admin === user?._id && (
                    <Button onPress={() => setRenamingGroup(true)} className="mb-4">
                      <Text className="font-bold text-white">Rename Group</Text>
                    </Button>
                  )
                )}

                <View className="mb-4">
                  <Text className="mb-2 text-xl font-bold text-gray-800">Participants</Text>
                  {groupDetails?.participants?.map((part) => (
                    <View
                      key={part._id}
                      className="flex-row items-center justify-between border-b border-gray-200 py-2">
                      <View className="flex-row items-center">
                        <Image
                          source={{ uri: part.avatar.url }}
                          className="h-10 w-10 rounded-full"
                        />
                        <View className="ml-3">
                          <Text className="font-semibold">{part.username}</Text>
                          <Text className="text-sm text-gray-600">{part.email}</Text>
                        </View>
                      </View>
                      {part._id === groupDetails.admin && (
                        <Text className="rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-800">
                          admin
                        </Text>
                      )}
                      {groupDetails.admin === user?._id && part._id !== user?._id && (
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
                          }}
                          className="bg-red-500">
                          <Text className="font-bold text-white">Remove</Text>
                        </Button>
                      )}
                    </View>
                  ))}
                </View>

                {groupDetails?.admin === user?._id && (
                  <View className="space-y-4">
                    {!addingParticipant ? (
                      <Button onPress={() => setAddingParticipant(true)}>
                        <Text className="font-bold text-white">Add Participant</Text>
                      </Button>
                    ) : (
                      <View className="space-y-2">
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
                        {/* <Select
                          placeholder="Select a user to add..."
                          value={participantToBeAdded}
                          options={users.map((user) => ({ label: user.username, value: user._id }))}
                          onChange={({ value }) => {
                            setParticipantToBeAdded(value);
                          }}
                        /> */}
                        <Button onPress={addParticipant}>
                          <Text className="font-bold text-white">Add</Text>
                        </Button>
                        <Button
                          onPress={() => {
                            setAddingParticipant(false);
                            setParticipantToBeAdded('');
                          }}>
                          <Text className="font-bold text-white">Cancel</Text>
                        </Button>
                      </View>
                    )}
                    <Button
                      onPress={() => {
                        Alert.alert('Delete Group', 'Are you sure you want to delete this group?', [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'OK', onPress: deleteGroupChat },
                        ]);
                      }}
                      className="bg-red-500">
                      <Text className="font-bold text-white">Delete Group</Text>
                    </Button>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </Modal>
      <UserSelectionModal
        visible={isUserSelectionModalVisible}
        onClose={() => setIsUserSelectionModalVisible(false)}
        onSelect={handleUserSelect}
        users={users}
        isGroupChat={false}
        selectedUsers={isGroupChat ? groupParticipants : selectedUserId ? [selectedUserId] : []}
      />
    </>
  );
};

export default GroupChatDetailsModal;
