import React, { useState } from 'react';
import { View, Button, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Text } from 'react-native';

export default function DTPicker() {
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const showMode = (currentMode: any) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

  return (
    <View>
      <View>
        <Button onPress={showDatepicker} title="Show date picker" />
      </View>
      <View>
        <Button onPress={showTimepicker} title="Show time picker" />
      </View>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          // @ts-ignore
          mode={mode}
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      )}
      <Text>Selected Date: {date.toLocaleDateString()}</Text>
      <Text>Selected Time: {date.toLocaleTimeString()}</Text>
    </View>
  );
}
