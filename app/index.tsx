import { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Input, Icon, Button } from '@rneui/themed';

import * as ImagePicker from 'expo-image-picker';
import DropDown from '~/components/dropDown/DropDown';
import DropdownComponent from '~/components/BrachSelector';
import { TextInput } from 'react-native-paper';

import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import DTPicker from '~/components/DatetimePicker';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View>
      <Image source={{ uri: image || '' }} style={styles.image} />
      <Text onPress={pickImage} style={styles.textButton}>
        Select Image
      </Text>
      <Input placeholder="Enter Invoice number" />

      <DropdownComponent />
      <DTPicker />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
  },
  image: {
    width: '50%',
    aspectRatio: 1,
    alignSelf: 'center',
  },
  textButton: {
    alignSelf: 'center',
    fontWeight: 'bold',
    color: 'green',
    marginVertical: 10,
  },

  input: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 20,
  },
  label: {
    color: 'gray',
    fontSize: 16,
  },
});
