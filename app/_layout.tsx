import '../global.css';

import { Stack, SplashScreen } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import AuthProvider from '~/providers/AuthProvider';
import QueryProvider from '~/providers/QueryProvider';

// export {
//   // Catch any errors thrown by the Layout component.
//   ErrorBoundary,
// } from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

export default function Layout() {
  return (
    <PaperProvider>
    <AuthProvider>
      <QueryProvider>
        <Stack>
          <Stack.Screen name="postInvoice" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </QueryProvider>
    </AuthProvider>
    </PaperProvider>


  );
}
