import { Platform } from 'react-native';
import React from 'react';
import { Appbar, Divider, Menu, useTheme } from 'react-native-paper';

import useMenu from '~/hooks/useMenu';
import { supabase } from '~/utils/supabase';
import { router } from 'expo-router';
import { useAuth } from '~/providers/AuthProvider';

interface Props {
  title: string;
}

const Header = ({ title }: Props) => {
  const { session, loading } = useAuth();

  const theme = useTheme();

  const MORE_ICON = Platform.OS === 'ios' ? 'dots-horizontal' : 'dots-vertical';
  const { top, visible, openMenu, closeMenu } = useMenu();
  return (
    <Appbar.Header>
      {/* <Appbar.Action icon="menu" onPress={() => {}} /> */}
      {/* go back screen */}
      <Appbar.BackAction onPress={() => router.back()} />

      <Appbar.Content title={title} />

      <Menu
        style={{
          marginTop: top,
          // backgroundColor: 'red'
        }}
        visible={visible}
        onDismiss={closeMenu}
        anchor={<Appbar.Action icon={MORE_ICON} onPress={openMenu} />}>
        <Menu.Item disabled onPress={() => {}} title={session?.user.email} />
        <Divider />

        <Menu.Item
          onPress={async () => {
            supabase.auth.signOut();
            router.replace('/sign-in');
            
          }}
          title="Log out"
        />
        <Menu.Item
          onPress={async () => {
            await supabase.auth.signOut();
            router.push('/(chat)');
          }}
          title="Chat"
        />

        <Divider />
      </Menu>
    </Appbar.Header>
  );
};

export default Header;
