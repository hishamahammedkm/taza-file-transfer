import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  data: any;
  value?: any;
  setValue: (value: Invoice) => void;
};

const DropdownComponent = ({ value, setValue, data }: Props) => {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View className="mb-4">
      <View className={`border rounded-lg ${isFocus ? 'border-indigo-500' : 'border-gray-300'}`}>
        <Dropdown
          style={{
            height: 50,
            paddingHorizontal: 12,
          }}
          containerStyle={{
            borderRadius: 8,
            borderColor: '#e2e8f0',
            borderWidth: 1,
          }}
          placeholderStyle={{
            fontSize: 16,
            color: '#9ca3af',
          }}
          selectedTextStyle={{
            fontSize: 16,
            color: '#4b5563',
          }}
          inputSearchStyle={{
            height: 40,
            fontSize: 16,
            borderRadius: 6,
          }}
          iconStyle={{
            width: 20,
            height: 20,
          }}
          data={data}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Select Branch' : '...'}
          searchPlaceholder="Search..."
          value={value?.branch_id}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={(item) => {
            setValue({ ...value, branch_id: item?.value });
            setIsFocus(false);
          }}
          renderLeftIcon={() => (
            <Ionicons
              name="business-outline"
              size={24}
              color={isFocus ? '#6366f1' : '#9ca3af'}
              style={{ marginRight: 8 }}
            />
          )}
        />
      </View>
    </View>
  );
};

export default DropdownComponent;