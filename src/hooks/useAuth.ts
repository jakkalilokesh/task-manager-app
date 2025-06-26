import { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { User, AuthState } from '../types';

export const useAuth = () => {
  const [state, set] = useState<AuthState>({ user: null, loading: true, error: null });

  useEffect(() => {
    (async () => {
      try {
        const cognitoUser = await Auth.currentAuthenticatedUser();
        set({ user: mapUser(cognitoUser), loading: false, error: null });
      } catch {
        set(s => ({ ...s, loading: false }));
      }
    })();
  }, []);

  const mapUser = (c: any): User => ({
    id: c.attributes.sub,
    email: c.attributes.email,
    name: c.attributes.name ?? '',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString()
  });

  const signIn = async (email: string, password: string) => {
    set(s => ({ ...s, loading: true, error: null }));
    try {
      await Auth.signIn(email, password);
      const u = await Auth.currentAuthenticatedUser();
      set({ user: mapUser(u), loading: false, error: null });
      return true;
    } catch (e: any) {
      set({ user: null, loading: false, error: e.message });
      return false;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    set(s => ({ ...s, loading: true, error: null }));
    try {
      await Auth.signUp({ username: email, password, attributes: { email, name } });
      await signIn(email, password);          // auto login after confirm in dev
      return true;
    } catch (e: any) {
      set({ user: null, loading: false, error: e.message });
      return false;
    }
  };

  const signOut = async () => {
    await Auth.signOut();
    set({ user: null, loading: false, error: null });
  };

  return { ...state, signIn, signUp, signOut };
};
