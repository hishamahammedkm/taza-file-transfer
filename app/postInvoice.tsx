import React, { useState } from 'react';
import { Alert, Image, Text, TextInput, View, ScrollView, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DropdownComponent from '~/components/BrachSelector';
import DTPicker from '~/components/DatetimePicker';
import * as FileSystem from 'expo-file-system';
import { randomUUID } from 'expo-crypto';
import { supabase } from '~/utils/supabase';
import { decode } from 'base64-arraybuffer';
import { useBranches, useInsertInvoice } from '~/api/invoice';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWindowDimensions } from 'react-native';
import Header from '~/components/Header';

interface FormData {
  invoice_number: string;
  branch_id: string;
  remarks: string;
  date_time: Date;
}

const schema = yup.object().shape({
  invoice_number: yup.string().required('Invoice number is required'),
  branch_id: yup.string().required('Branch is required'),
  remarks: yup.string().required('Remarks are required'),
  date_time: yup.date().required('Date and time are required'),
});

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const { data: branchesData, error: branchesError } = useBranches();
  const { mutate: insertInvoice } = useInsertInvoice();
  const { width } = useWindowDimensions();
  const isTablet = width > 768;

  const branches = branchesData?.map((branch) => ({ value: branch.id, label: branch.name })) || [];

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      invoice_number: '',
      branch_id: '',
      remarks: '',
      date_time: new Date(),
    },
  });

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

    if (data) {
      return data.path;
    }
  };

  const onSubmit = async (data: FormData) => {
    if (loading) return;
    setLoading(true);
    const file_path = await uploadImage();
    insertInvoice(
      { ...data, file_path },
      {
        onSuccess: () => {
          setImage(null);
          setValue('invoice_number', '');
          setValue('branch_id', '');
          setValue('remarks', '');
          setValue('date_time', new Date());
          Alert.alert('Success', 'Invoice added successfully!');
        },
      }
    );
    setLoading(false);
  };

  return (
    <>
      <Header title='Invoice' />
      <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} className="flex-1">
        <ScrollView contentContainerClassName="flex-grow">
          <View className={`flex-1 justify-center p-8 ${isTablet ? 'px-16' : ''}`}>
            <View className="rounded-3xl bg-white bg-opacity-90 p-8 shadow-lg">
              <Text className="mb-6 text-center text-3xl font-bold text-gray-800">Add Invoice</Text>

              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="mb-4">
                    <View
                      className={`flex-row items-center rounded-lg border px-3 py-2 ${errors.invoice_number ? 'border-red-500' : 'border-gray-300'}`}>
                      <Ionicons
                        name="document-text-outline"
                        size={24}
                        color="#666"
                        className="mr-2"
                      />
                      <TextInput
                        className="flex-1 text-base"
                        placeholder="Invoice Number"
                        placeholderTextColor="#999"
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                      />
                    </View>
                    {errors.invoice_number && (
                      <Text className="mt-1 text-xs text-red-500">
                        {errors.invoice_number.message}
                      </Text>
                    )}
                  </View>
                )}
                name="invoice_number"
              />

              <Controller
                control={control}
                render={({ field: { onChange, value } }) => (
                  <View className="mb-4">
                    <DropdownComponent
                      data={branches}
                      value={{ branch_id: value }}
                      setValue={(newValue) => onChange(newValue.branch_id)}
                    />
                    {errors.branch_id && (
                      <Text className="mt-1 text-xs text-red-500">{errors.branch_id.message}</Text>
                    )}
                  </View>
                )}
                name="branch_id"
              />

              <Controller
                control={control}
                render={({ field: { onChange, value } }) => (
                  <View className="mb-4">
                    <DTPicker
                      value={{ date_time: value }}
                      setValue={(newValue) => onChange(newValue.date_time)}
                    />
                    {errors.date_time && (
                      <Text className="mt-1 text-xs text-red-500">{errors.date_time.message}</Text>
                    )}
                  </View>
                )}
                name="date_time"
              />

              <TouchableOpacity
                className="mb-4 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4"
                onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image }} className="h-48 w-full rounded-lg" />
                ) : (
                  <View className="items-center">
                    <Ionicons name="cloud-upload-outline" size={48} color="#666" />
                    <Text className="mt-2 text-gray-500">Upload Invoice Image</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className="mb-6">
                    <View
                      className={`rounded-lg border px-3 py-2 ${errors.remarks ? 'border-red-500' : 'border-gray-300'}`}>
                      <TextInput
                        className="h-24 text-base" // Set a fixed height
                        placeholder="Remarks"
                        placeholderTextColor="#999"
                        multiline={true}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                        textAlignVertical="top"
                        scrollEnabled={true} // Enable scrolling within the TextInput
                      />
                    </View>
                    {errors.remarks && (
                      <Text className="mt-1 text-xs text-red-500">{errors.remarks.message}</Text>
                    )}
                  </View>
                )}
                name="remarks"
              />

              <TouchableOpacity
                className={`items-center rounded-lg bg-indigo-600 py-3 shadow-md ${loading ? 'opacity-70' : ''}`}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}>
                <Text className="text-lg font-bold text-white">
                  {loading ? 'Submitting...' : 'Add Invoice'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}
