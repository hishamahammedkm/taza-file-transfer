import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Link, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '~/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Define the shape of our form data
interface FormData {
  name: string;
  email: string;
  password: string;
}

// Define our validation schema
const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const SignUpScreen: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { width } = useWindowDimensions();
  const isTablet = width > 768;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      if (authData && authData.user) {
        const { error: updateError } = await supabase
          .from('user_profile')
          .update({ name: data.name })
          .eq('id', authData.user.id);

        if (updateError) throw updateError;

        Alert.alert('Success', 'Account created successfully!');
      }
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} className="flex-1">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerClassName="flex-grow">
        <View className={`flex-1 justify-center p-8 ${isTablet ? 'px-16' : ''}`}>
          <View className="rounded-3xl bg-white bg-opacity-90 p-8 shadow-lg">
            <View className="mb-8 items-center">
              <Image source={require('~/assets/splash.png')} className="h-32 w-32 rounded-full" />
              <Text className="mt-4 text-3xl font-bold text-gray-800">Create Account</Text>
            </View>

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="mb-4">
                  <View
                    className={`flex-row items-center rounded-lg border px-3 py-2 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}>
                    <Ionicons name="person-outline" size={24} color="#666" className="mr-2" />
                    <TextInput
                      className="flex-1 text-base"
                      placeholder="Name"
                      placeholderTextColor="#999"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                  </View>
                  {errors.name && (
                    <Text className="mt-1 text-xs text-red-500">{errors.name.message}</Text>
                  )}
                </View>
              )}
              name="name"
              defaultValue=""
            />

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="mb-4">
                  <View
                    className={`flex-row items-center rounded-lg border px-3 py-2 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}>
                    <Ionicons name="mail-outline" size={24} color="#666" className="mr-2" />
                    <TextInput
                      className="flex-1 text-base"
                      placeholder="Email"
                      placeholderTextColor="#999"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {errors.email && (
                    <Text className="mt-1 text-xs text-red-500">{errors.email.message}</Text>
                  )}
                </View>
              )}
              name="email"
              defaultValue=""
            />

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="mb-6">
                  <View
                    className={`flex-row items-center rounded-lg border px-3 py-2 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}>
                    <Ionicons name="lock-closed-outline" size={24} color="#666" className="mr-2" />
                    <TextInput
                      className="flex-1 text-base"
                      placeholder="Password"
                      placeholderTextColor="#999"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      secureTextEntry
                    />
                  </View>
                  {errors.password && (
                    <Text className="mt-1 text-xs text-red-500">{errors.password.message}</Text>
                  )}
                </View>
              )}
              name="password"
              defaultValue=""
            />

            <TouchableOpacity
              className={`items-center rounded-lg bg-indigo-600 py-3 shadow-md ${loading ? 'opacity-70' : ''}`}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}>
              <Text className="text-lg font-bold text-white">
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            <View className="mt-6 flex-row justify-center">
              <Text className="text-gray-600">Already have an account? </Text>
              <Link href="/sign-in" asChild>
                <Text className="font-bold text-indigo-600">Sign In</Text>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default SignUpScreen;
