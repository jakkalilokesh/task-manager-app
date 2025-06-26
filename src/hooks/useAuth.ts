/* ------------------------------------------------------------------
   src/hooks/useAuth.ts      (REPLACE WHOLE FILE WITH THIS CONTENT)
-------------------------------------------------------------------*/
import { useState, useEffect } from 'react';
import { Amplify, Auth } from 'aws-amplify';
import awsExports from '../aws-exports';
import { User, AuthState } from '../types';

Amplify.configure(awsExports);           // ← one-time init

// 🔐 Convert Cognito user → our User shape
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

  /* --------------------------------------------------------------
     1️⃣  Check for an existing Cognito session on app start
  ----------------------------------------------------------------*/
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

  /* --------------------------------------------------------------
     2️⃣  Sign-in with Cognito
  ----------------------------------------------------------------*/
  const signIn = async (email: string, password: string): Promise<boolean> => {
    set(s => ({ ...s, loading: true, error: null }));
    try {
      await Auth.signIn(email, password);
      const u = await Auth.currentAuthenticatedUser();
      set({ user: mapUser(u), loading: false, error: null });
      return true;
    } catch (err: any) {
      set({ user: null, loading: false, error: err.message });
      return false;
    }
  };

  /* --------------------------------------------------------------
     3️⃣  Sign-up with Cognito (auto-login after success)
  ----------------------------------------------------------------*/
  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    set(s => ({ ...s, loading: true, error: null }));
    try {
      await Auth.signUp({
        username: email,
        password,
        attributes: { email, name },
        autoSignIn: { enabled: true },   // skip confirm in dev; remove in prod
      });
      const u = await Auth.currentAuthenticatedUser();
      set({ user: mapUser(u), loading: false, error: null });
      return true;
    } catch (err: any) {
      set({ user: null, loading: false, error: err.message });
      return false;
    }
  };

  /* --------------------------------------------------------------
     4️⃣  Sign-out
  ----------------------------------------------------------------*/
  const signOut = async () => {
    await Auth.signOut();
    set({ user: null, loading: false, error: null });
  };

  return { ...state, signIn, signUp, signOut };
};
