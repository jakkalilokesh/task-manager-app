/* ------------------------------------------------------------------
   src/hooks/useAuth.ts
   – Cognito signup + OTP confirm + signin + signout in one hook
-------------------------------------------------------------------*/
import { useState, useEffect } from 'react';
import { Amplify, Auth } from 'aws-amplify';
import awsExports from '../aws-exports.js';
import { User, AuthState } from '../types';

Amplify.configure(awsExports);

// map Cognito user → local shape
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

  /* ─────────────────── 1. check existing session ─────────────────── */
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

  /* ─────────────────── 2. sign-up (sends OTP) ────────────────────── */
  const signUp = async (email: string, pwd: string, name: string) => {
    set(s => ({ ...s, loading: true, error: null }));
    try {
      await Auth.signUp({ username: email, password: pwd, attributes: { email, name } });
      setNeedsConfirm(true);                    // show OTP UI
      set(s => ({ ...s, loading: false }));
      return true;
    } catch (e: any) {
      set({ user: null, loading: false, error: e.message });
      return false;
    }
  };

  /* ─────────────────── 3. confirm OTP ────────────────────────────── */
  const confirmSignUp = async (email: string, code: string) => {
    set(s => ({ ...s, loading: true, error: null }));
    try {
      await Auth.confirmSignUp(email, code);
      setNeedsConfirm(false);
      return true;
    } catch (e: any) {
      set(s => ({ ...s, loading: false, error: e.message }));
      return false;
    }
  };

  /* ─────────────────── 4. resend OTP ─────────────────────────────── */
  const resendCode = async (email: string) => {
    try {
      await Auth.resendSignUp(email);
    } catch (e: any) {
      set(s => ({ ...s, error: e.message }));
    }
  };

  /* ─────────────────── 5. sign-in ─────────────────────────────────── */
  const signIn = async (email: string, pwd: string) => {
    set(s => ({ ...s, loading: true, error: null }));
    try {
      await Auth.signIn(email, pwd);
      const u = await Auth.currentAuthenticatedUser();
      set({ user: mapUser(u), loading: false, error: null });
      return true;
    } catch (e: any) {
      if (e.code === 'UserNotConfirmedException') setNeedsConfirm(true);
      set({ user: null, loading: false, error: e.message });
      return false;
    }
  };

  /* ─────────────────── 6. sign-out ───────────────────────────────── */
  const signOut = async () => {
    await Auth.signOut();
    set({ user: null, loading: false, error: null });
  };

  return {
    ...state,
    needsConfirm,
    signUp,
    confirmSignUp,
    resendCode,
    signIn,
    signOut,
  };
};
