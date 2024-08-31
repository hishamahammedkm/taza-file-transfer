import React, { useState } from 'react';
import { View, Pressable, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  value?: Invoice;
  setValue: (value: Invoice) => void;
};

export default function DTPicker({ value, setValue }: Props) {
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [show, setShow] = useState(false);

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || value?.date_time || new Date();
    setShow(Platform.OS === 'ios');

    if (mode === 'date') {
      setValue({ ...value, date_time: currentDate });
      setMode('time');
      setShow(true);
    } else {
      setValue({ ...value, date_time: currentDate });
      setShow(false);
    }
  };

  const showDatepicker = () => {
    setMode('date');
    setShow(true);
  };

  return (
    <View className="mb-4">
      <Pressable 
        onPress={showDatepicker}
        className="flex-row items-center border rounded-lg px-3 py-2 border-gray-300 bg-white"
      >
        <Ionicons name="calendar-outline" size={24} color="#666" className="mr-2" />
        <Text className="flex-1 text-base text-gray-700">
          {value?.date_time
            ? `${value.date_time.toLocaleDateString()} ${value.date_time.toLocaleTimeString()}`
            : 'Select Date and Time'}
        </Text>
        <Ionicons name="chevron-down-outline" size={24} color="#666" />
      </Pressable>

      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={value?.date_time || new Date()}
          mode={mode}
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
}