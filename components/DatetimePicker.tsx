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
    
    if (mode === 'date') {
        setDate(currentDate);
        setMode('time');  // Change to time picker after selecting date
        setShow(true);    // Show the time picker
      } else {
        setDate(currentDate); // Update the date with the selected time
        setShow(false);       // Close the picker
      }
  };

  const showMode = (currentMode: any) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
    setShow(true);

  };

  const showTimepicker = () => {
    showMode('time');
  };

  return (
    <View>
      <View>
        <Button onPress={showDatepicker} title="Show date picker" />
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
      <Text>Selected Date and Time: {date.toLocaleDateString()}  {date.toLocaleTimeString()}</Text>

    </View>
  );
}
