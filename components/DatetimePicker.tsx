import React, { useState } from 'react';
import { View, Button, Platform, StyleSheet, Pressable } from 'react-native';
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
      setMode('time'); // Change to time picker after selecting date
      setShow(true); // Show the time picker
    } else {
      setDate(currentDate); // Update the date with the selected time
      setShow(false); // Close the picker
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
    <View style={styles.container}>
      <Pressable onPress={showDatepicker} className="rounded-full bg-white p-2">
        <Text className=" mt-2 self-center text-lg  font-extrabold text-red-600">
          Date and Time: {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </Text>
      </Pressable>

      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={mode}
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // padding: 16,
    // backgroundColor: '#FFF1D7', // Light background color inspired by the logo's border
    // borderRadius: 10,
  },
  buttonContainer: {
    marginBottom: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  selectedDateText: {
    color: '#D32F2F', // Red color similar to the logo's text
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
});
