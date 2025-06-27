// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { Amplify, Auth } from 'aws-amplify';
import awsExports from '../aws-exports.js';
import { User, AuthState } from '../types';

Amplify.configure(awsExports);

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

  const [needsConfirm, setNeedsConfirm] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const u = await Auth.currentAuthenticatedUser();
        set({ user: mapUser(u), loading: false, error: null });
      } catch {
        set((s) => ({ ...s, loading: false }));
      }
    })();
  }, []);

  const signIn = async (email: string, pwd: string): Promise<boolean> => {
    set((s) => ({ ...s, loading: true, error: null }));
    try {
      await Auth.signIn(email, pwd);
      const u = await Auth.currentAuthenticatedUser();
      set({ user: mapUser(u), loading: false, error: null });
      setNeedsConfirm(false);
      return true;
    } catch (e: any) {
      if (e.code === 'UserNotConfirmedException') {
        setNeedsConfirm(true);
      }
      set({ user: null, loading: false, error: e.message });
      return false;
    }
  };

  const signUp = async (email: string, pwd: string, name: string): Promise<boolean> => {
    set((s) => ({ ...s, loading: true, error: null }));
    try {
      await Auth.signUp({ username: email, password: pwd, attributes: { email, name } });
      setNeedsConfirm(true);
      set((s) => ({ ...s, loading: false }));
      return true;
    } catch (e: any) {
      set({ user: null, loading: false, error: e.message });
      return false;
    }
  };

  // ✅ Fix: auto sign-in after OTP
  const confirmSignUp = async (email: string, code: string, pwd?: string): Promise<boolean> => {
    set((s) => ({ ...s, loading: true, error: null }));
    try {
      await Auth.confirmSignUp(email, code);
      if (pwd) await Auth.signIn(email, pwd);
      const u = await Auth.currentAuthenticatedUser();
      set({ user: mapUser(u), loading: false, error: null });
      setNeedsConfirm(false);
      return true;
    } catch (e: any) {
      set({ user: null, loading: false, error: e.message });
      return false;
    }
  };

  const resendCode = async (email: string) => {
    await Auth.resendSignUp(email);
  };

  const signOut = async () => {
    await Auth.signOut();
    set({ user: null, loading: false, error: null });
    setNeedsConfirm(false);
  };

  return {
    ...state,
    needsConfirm,
    signIn,
    signUp,
    confirmSignUp,
    resendCode,
    signOut,
  };
};
