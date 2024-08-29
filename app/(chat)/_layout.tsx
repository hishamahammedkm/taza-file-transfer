import { Slot } from 'expo-router';
import Header from '~/components/Header';

export default function ChatLayout() {
  return (
    <>
      <Header title="Chat" />
      <Slot />
    </>
  );
}
