import { PaperProvider } from 'react-native-paper';
import '../global.css';

import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <PaperProvider>
      <Stack />
    </PaperProvider>
  );
}
