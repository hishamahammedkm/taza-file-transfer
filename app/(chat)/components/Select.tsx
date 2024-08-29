import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { classNames } from '../lib';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: Option) => void;
  placeholder: string;
}

const Select: React.FC<SelectProps> = ({ options, value, placeholder, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localOptions, setLocalOptions] = useState<Option[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  const selectedOption = options.find((o) => o.value === value);

  const filterOptions = (text: string) => {
    setSearchTerm(text);
    setLocalOptions(options.filter((op) => op.label.toLowerCase().includes(text.toLowerCase())));
  };

  const renderOption = ({ item }: { item: Option }) => (
    <TouchableOpacity
      className={classNames('rounded-2xl px-3 py-4', item.value === value ? 'bg-taza-light' : '')}
      onPress={() => {
        onChange(item);
        setIsOpen(false);
      }}>
      <Text className={classNames('text-taza-dark', item.value === value ? 'font-semibold' : '')}>
        {item.label}
      </Text>
      {item.value === value && (
        <Ionicons
          name="checkmark"
          size={24}
          color="#FFA500"
          style={{ position: 'absolute', right: 12, top: 12 }}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View className="mt-2 w-full">
      <TouchableOpacity
        className="border-taza-orange w-full rounded-xl border bg-white px-5 py-4"
        onPress={() => setIsOpen(true)}>
        <Text className={classNames('text-taza-dark', !selectedOption ? 'text-taza-dark/50' : '')}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={24}
          color="#FFA500"
          style={{ position: 'absolute', right: 12, top: 12 }}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="h-3/4 rounded-t-3xl bg-white p-5">
            <TextInput
              className="border-taza-orange mb-4 w-full rounded-xl border bg-white px-5 py-4"
              placeholder="Search..."
              value={searchTerm}
              onChangeText={filterOptions}
            />
            <FlatList
              data={localOptions}
              renderItem={renderOption}
              keyExtractor={(item) => item.value}
              className="flex-1"
            />
            <TouchableOpacity
              className="bg-taza-orange mt-4 rounded-xl px-5 py-4"
              onPress={() => setIsOpen(false)}>
              <Text className="text-center font-semibold text-white">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Select;
