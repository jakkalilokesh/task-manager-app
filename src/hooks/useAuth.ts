/* ------------------------------------------------------------------
   src/hooks/useAuth.ts
-------------------------------------------------------------------*/
import { useState, useEffect } from 'react';
import { Amplify } from '@aws-amplify/core';      // ✅ Correct source for Amplify v5+
import { Auth } from '@aws-amplify/auth';         // ✅ Correct source for Auth v5+
import awsExports from '../aws-exports';          // ✅ This path is correct
import { User, AuthState } from '../types';

Amplify.configure(awsExports);

// ✅ rest of your useAuth code remains the same


// Convert Cognito user → local <User> shape
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

  /* 1️⃣  Check existing session on app load */
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

  /* 2️⃣  Sign-in */
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

  /* 3️⃣  Sign-up (auto-login after success) */
  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    set(s => ({ ...s, loading: true, error: null }));
    try {
      await Auth.signUp({
        username: email,
        password,
        attributes: { email, name },
        autoSignIn: { enabled: true }, // skip email-verify in dev
      });
      const u = await Auth.currentAuthenticatedUser();
      set({ user: mapUser(u), loading: false, error: null });
      return true;
    } catch (err: any) {
      set({ user: null, loading: false, error: err.message });
      return false;
    }
  };

  /* 4️⃣  Sign-out */
  const signOut = async () => {
    await Auth.signOut();
    set({ user: null, loading: false, error: null });
  };

  return { ...state, signIn, signUp, signOut };
};
