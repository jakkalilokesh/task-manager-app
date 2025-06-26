import { useState, useEffect } from 'react';
import { Amplify, Auth } from 'aws-amplify';       // v4 bundle
import awsExports from '../aws-exports.js'; // ✅ Correct for JS file in TS project// 👈 add “.js”, path is one level up
import { User, AuthState } from '../types';

Amplify.configure(awsExports);


Amplify.configure(awsExports);                          // one-time init

const mapUser = (c: any): User => ({
  id: c.attributes.sub,
  email: c.attributes.email,
  name: c.attributes.name ?? '',
  created_at: new Date().toISOString(),
  last_login: new Date().toISOString(),
});

export const useAuth = () => {
  const [state, set] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  /* session on mount */
  useEffect(() => {
    (async () => {
      try {
        const u = await Auth.currentAuthenticatedUser();
        set({ user: mapUser(u), loading: false, error: null });
      } catch {
        set(s => ({ ...s, loading: false }));
      }
    })();
  }, []);

  const signIn = async (email: string, pwd: string) => {
    set(s => ({ ...s, loading: true, error: null }));
    try {
      await Auth.signIn(email, pwd);
      const u = await Auth.currentAuthenticatedUser();
      set({ user: mapUser(u), loading: false, error: null });
      return true;
    } catch (e: any) {
      set({ user: null, loading: false, error: e.message });
      return false;
    }
  };

  const signUp = async (email: string, pwd: string, name: string) => {
    set(s => ({ ...s, loading: true, error: null }));
    try {
      await Auth.signUp({ username: email, password: pwd, attributes: { email, name } });
      await signIn(email, pwd);                         // auto-login
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
