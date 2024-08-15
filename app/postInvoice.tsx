import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DropdownComponent from '~/components/BrachSelector';
import DTPicker from '~/components/DatetimePicker';

import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import { randomUUID } from 'expo-crypto';
import { supabase } from '~/utils/supabase';
import { decode } from 'base64-arraybuffer';
import { useInsertInvoice } from '~/api/invoice';
import { TouchableOpacity } from 'react-native';
import Header from '~/components/Header';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const { mutate: insertInvoice, isSuccess, error, isPending, status } = useInsertInvoice();
  console.log('isSuccess, error, isPending, status---', isSuccess, error, isPending, status);

  const [invoice, setInvoice] = useState<Invoice>({
    invoice_number: '',
    branch_code: '',
    remarks: '',
    file_path: '',
    date_time: new Date(),
  });

  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  const uploadImage = async () => {
    if (!image?.startsWith('file://')) {
      return;
    }

    const fileEx = image.split('.').pop() || 'png';
    const base64 = await FileSystem.readAsStringAsync(image, {
      encoding: 'base64',
    });
    const filePath = `invoices/${randomUUID()}.${fileEx}`;
    const contentType = `image/${fileEx}`;

    const { data, error } = await supabase.storage
      .from('assets')
      .upload(filePath, decode(base64), { contentType });

    console.log(error);

    if (data) {
      return data.fullPath;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const file_path = await uploadImage();
    // if (!file_path) {
    //   return;
    // }

    insertInvoice(
      { ...invoice, file_path },
      {
        onSuccess: () => {
          console.log('ssssss');

          setImage(null);
          setInvoice({
            invoice_number: '',
            branch_code: '',
            remarks: '',
            file_path: '',
            date_time: new Date(),
          });
        },
      }
    );
    setLoading(false);
    Alert.alert('Success');
  };

  return (
    // hide header using stack

    <>
      <Header title="Add Invoice" />
      <View className="flex h-screen gap-5 bg-red-500 p-5">
        <TextInput
          className="text-red-500"
          style={styles.input}
          placeholder="Enter invoice number..."
          placeholderTextColor="#FFB03B" // Light yellow color similar to the border in the logo
          value={invoice.invoice_number}
          onChangeText={(text) => setInvoice({ ...invoice, invoice_number: text })}
        />

        <DropdownComponent value={invoice} setValue={setInvoice} />
        <DTPicker value={invoice} setValue={setInvoice} />
        {!image && (
          <Pressable
            className="flex h-60 items-center justify-center rounded-lg bg-white"
            onPress={pickImage}>
            <Text className="font-bold text-yellow-500">Pick an image</Text>
          </Pressable>
        )}
        {image && <Image source={{ uri: image }} style={styles.image} />}

        {/* text area */}
        <TextInput
          className="rounded-lg bg-white p-3 font-bold text-red-500 placeholder:text-yellow-500 "
          placeholder="Remarks"
          placeholderTextColor="yellow"
          multiline={true}
          numberOfLines={4}
          onChangeText={(text) => setInvoice({ ...invoice, remarks: text })}
          value={invoice.remarks}
          textAlignVertical="top" // Ensures the text starts from the top
        />

        <TouchableOpacity
          className="mt-5 items-center rounded-full bg-yellow-400 px-8 py-3"
          onPress={() => {
            handleSubmit();
          }}>
          <Text className="text-red-500" style={styles.submitButtonText}>
            {loading ? 'Submitting...' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    padding: 16,
    backgroundColor: '#FFF1D7',
    // gap:10 // Light background color inspired by the logo's border
  },
  image: {
    width: '100%',
    aspectRatio: 1,

    alignSelf: 'center',
    // width: "auto",
    // // height: "auto",
    height: 300,
    // objectFit:"contain",
    borderRadius: 15,
    marginBottom: 10,
    // backgroundColor: '#FFD7B5', // Placeholder background when no image is selected
    borderColor: '#D32F2F', // Red border color to match the logo
    borderWidth: 2,
  },
  textButton: {
    textAlign: 'center',
    color: '#D32F2F', // Red color similar to the logo's text
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#D32F2F', // Red color similar to the background of the logo
    borderWidth: 1,
    borderRadius: 25, // Rounded corners like the circular design in the logo
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#D32F2F', // Red color inspired by the logo
    borderRadius: 25, // Rounded corners to match the logo's style
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF', // White text for contrast
    fontSize: 18,
    fontWeight: 'bold',
  },
});
