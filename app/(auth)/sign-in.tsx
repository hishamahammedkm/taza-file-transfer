import { View, Text, TextInput, StyleSheet, Alert, Image } from 'react-native';
import React, { useState } from 'react';

import { Link, Stack } from 'expo-router';
import { supabase } from '~/utils/supabase';
import { Button } from 'react-native';
import { TouchableOpacity } from 'react-native';

const SignInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <View className="flex h-screen gap-3 bg-white p-5">
      <Stack.Screen options={{ title: 'Sign in' }} />
      <View className="flex-1 items-center justify-center">
        <Image source={require('~/assets/splash.jpeg')} style={styles.image} />
      </View>
      <View className="flex-1 gap-3">
        <TextInput
          placeholderTextColor="#FFB03B" // Light yellow color similar to the border in the logo
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          style={styles.input}
        />

        <TextInput
          placeholderTextColor="#FFB03B" // Light yellow color similar to the border in the logo
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          style={styles.input}
          secureTextEntry
        />

        <TouchableOpacity
          className="mt-3 items-center rounded-full bg-yellow-400 px-8 py-3"
          onPress={() => {
            signInWithEmail();
          }}>
          <Text className="text-red-500" style={styles.submitButtonText}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Text>
        </TouchableOpacity>
        <View>
          <Link className="" href="/sign-up" asChild>
            <Text className=" text-xs text-yellow-500">Create an account ?</Text>
          </Link>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    flex: 1,
  },
  label: {
    color: 'gray',
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
  image: {
    width: 350,
    height: 350,
    // width: 'auto',
    // objectFit: 'contain',
    // // height: '50%',
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
  textButton: {
    alignSelf: 'center',
    fontWeight: 'bold',
    color: 'red',
    marginVertical: 10,
  },
});

export default SignInScreen;
