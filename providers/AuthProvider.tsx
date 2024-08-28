import { Session } from '@supabase/supabase-js';
import { PropsWithChildren, createContext, useContext, useEffect, useState } from 'react';
import { UserInterface } from '~/interfaces/user';
import { ExpoSecureStoreAdapter, supabase } from '~/utils/supabase';
import axios from 'axios';
type AuthData = {
  user: UserInterface | null;
  token: string | null;

  session: Session | null;
  profile: any;
  loading: boolean;
};

const AuthContext = createContext<AuthData>({
  session: null,
  loading: true,
  profile: null,
  user: null,
  token: null,
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInterface | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);

      if (session) {
        // fetch profile
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(data || null);
      }

      setLoading(false);
    };

    fetchSession();
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);
  useEffect(() => {
    const getUser = async () => {
      const _token = (await supabase.auth.getSession()).data.session?.access_token;
      if (_token) {
        ExpoSecureStoreAdapter.setItem('token', _token);
      }
      console.log('_token from auth context', _token);

      setToken(_token!);

      const Suser = await supabase.auth.getUser();
      let user: UserInterface | null;
      if (Suser) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${_token}`;

        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URI}/chat-app/chats/_id/${Suser.data.user?.id!}`
        );

        if (!data.data._id) {
          console.log(' Chat server not responding');
        }

        user = {
          _id: data.data._id!,
          email: Suser.data.user?.email!,
          username: Suser.data.user?.email!,
          createdAt: Suser.data.user?.created_at!,
          updatedAt: Suser.data.user?.updated_at!,
          avatar: {
            _id: Suser.data.user?.id!,
            url: '',
            localPath: '',
          },
        };

        setUser(user);
      } else {
        setUser(null);
      }
    };
    getUser();
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, profile, user, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
