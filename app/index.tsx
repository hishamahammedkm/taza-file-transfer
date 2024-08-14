import { View, Text, ActivityIndicator } from 'react-native';
import React from 'react';

import { Link, Redirect } from 'expo-router';
import { useAuth } from '~/providers/AuthProvider';
import { supabase } from '~/utils/supabase';

const index = () => {
  const { session, loading } = useAuth();
  console.log('session---', session, loading);

//   if (loading) {
//     return <ActivityIndicator />;
//   }

  if (!session) {
    return <Redirect href={'(auth)/sign-in'} />;
  }

  return <Redirect href={'/postInvoice'} />;
};

export default index;
