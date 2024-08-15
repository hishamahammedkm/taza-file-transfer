import { Platform } from 'react-native';
import React from 'react';
import { Appbar, Divider, Menu, useTheme } from 'react-native-paper';

import useMenu from '~/hooks/useMenu';
import { supabase } from '~/utils/supabase';

interface Props {
  title: string;
}

const Header = ({ title }: Props) => {
  const theme = useTheme();

  const MORE_ICON = Platform.OS === 'ios' ? 'dots-horizontal' : 'dots-vertical';
  const { top, visible, openMenu, closeMenu } = useMenu();
  return (
    <Appbar.Header>
      {/* <Appbar.Action icon="menu" onPress={() => {}} /> */}

      <Appbar.Content title={title} />

      <Menu
        style={{
          marginTop: top,
          // backgroundColor: 'red'
        }}
        visible={visible}
        onDismiss={closeMenu}
        anchor={<Appbar.Action icon={MORE_ICON} onPress={openMenu} />}>
        <Menu.Item disabled onPress={() => {}} title="Hisham ahammed" />
        <Divider />

        <Menu.Item
          onPress={() => {
            supabase.auth.signOut();
          }}
          title="Log out"
        />

        <Divider />
      </Menu>
    </Appbar.Header>
  );
};

export default Header;
