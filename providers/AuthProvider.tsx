import { Session } from '@supabase/supabase-js';
import { PropsWithChildren, createContext, useContext, useEffect, useState } from 'react';
import { UserInterface } from '~/interfaces/user';
import { ExpoSecureStoreAdapter, supabase } from '~/utils/supabase';
import axios from 'axios';
import { router } from 'expo-router';
type AuthData = {
  user: UserInterface | null;
  token: string | null;

  session: Session | null;
  profile: any;
  loading: boolean;
  logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthData>({
  session: null,
  loading: true,
  profile: null,
  user: null,
  token: null,
  logOut: async () => {},
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInterface | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const logOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
    setSession(null);
    ExpoSecureStoreAdapter.removeItem('currentChat');

    router.replace('/(auth)/sign-in');
  };

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setToken(session?.access_token!);

      if (session) {
        const setUp = async () => {
          const Suser = await supabase.auth.getUser();
          // console.log('Suser', Suser);
          let user: UserInterface | null;

          if (Suser) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;

            const { data } = await axios.get(
              `${process.env.EXPO_PUBLIC_SERVER_URI}/chat-app/chats/_id/${Suser.data.user?.id!}`
            );

            if (data.data._id) {
              user = {
                _id: data.data._id!,
                email: Suser.data.user?.email!,
                username: data.data?.username!,
                createdAt: Suser.data.user?.created_at!,
                updatedAt: Suser.data.user?.updated_at!,
                avatar: {
                  _id: Suser.data.user?.id!,
                  url: '',
                  localPath: '',
                },
              };

              setUser(user);
            }
          } else {
            setUser(null);
          }
        };
        setUp();
      }

      setLoading(false);
    };

    fetchSession();
    supabase.auth.onAuthStateChange((_event, session) => {
      fetchSession();
    });
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, profile, user, token, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
