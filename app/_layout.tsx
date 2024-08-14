
import '../global.css';

import { Stack, SplashScreen } from 'expo-router';
import AuthProvider from '~/providers/AuthProvider';

// export {
//   // Catch any errors thrown by the Layout component.
//   ErrorBoundary,
// } from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

export default function Layout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="postInvoice" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
