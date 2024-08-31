import { View, Text, ActivityIndicator } from 'react-native';
import React from 'react';

import { Link, Redirect } from 'expo-router';
import { useAuth } from '~/providers/AuthProvider';

const index = () => {
  const { session, loading } = useAuth();
  //   if (loading) {
  //     return <ActivityIndicator />;
  //   }

  if (!session) {
    return <Redirect href={'(auth)/sign-in'} />;
  }
  // return <Redirect href={'(chat)'} />;

  return <Redirect href={'/postInvoice'} />;
};

export default index;
