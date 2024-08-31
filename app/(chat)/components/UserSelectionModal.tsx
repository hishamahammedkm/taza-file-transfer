import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserInterface } from 'interfaces/user';

interface UserSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (userId: string) => void;
  users: UserInterface[];
  isGroupChat: boolean;
  selectedUsers: string[];
}

const UserSelectionModal: React.FC<UserSelectionModalProps> = ({
  visible,
  onClose,
  onSelect,
  users,
  isGroupChat,
  selectedUsers,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users);

  useEffect(() => {
    setFilteredUsers(
      users.filter((user) => user.username.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, users]);

  const renderUserItem = ({ item }: { item: UserInterface }) => (
    <TouchableOpacity
      className="flex-row items-center border-b border-gray-200 p-3"
      onPress={() => onSelect(item._id)}>
      <Image source={{ uri: item.avatar.url }} className="h-10 w-10 rounded-full" />
      <Text className="ml-3 flex-1 text-lg">{item.username}</Text>
      {isGroupChat && selectedUsers.includes(item._id) && (
        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 bg-white">
        <View className="bg-indigo-600 p-4">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={onClose} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-white">Select Users</Text>
          </View>
          <View className="mt-4 flex-row items-center rounded-full bg-white px-4 py-2">
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              className="ml-2 flex-1 text-base"
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item._id}
        />
      </View>
    </Modal>
  );
};

export default UserSelectionModal;
