import { FlatList, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { Checkbox, Text } from 'react-native-paper';
type Props = {
  data: MenuItem;
  value: MenuItem | null;
  setValue: (value: MenuItem | null) => void;
  checked?: boolean;
  setChecked?: (checked: boolean) => void;
  hideModal: () => void;
};

const ListItem = ({ data, setValue, value, hideModal }: Props) => {
  return (
    <TouchableOpacity
      className={`flex flex-row items-center gap-5  `}
      onPress={() => {
        setValue(data);
        hideModal();
      }}>
      <Text variant="headlineSmall">{data.id}</Text>

      <Text variant="headlineSmall">{data.label}</Text>
    </TouchableOpacity>
  );
};

export default ListItem;
