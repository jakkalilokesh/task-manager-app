// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { Amplify, Auth } from 'aws-amplify';
import awsExports from '../aws-exports.js';
import { User, AuthState } from '../types';

Amplify.configure(awsExports);

/* map Cognito → local shape */
const map = (c: any): User => ({
  id:        c.attributes.sub,
  email:     c.attributes.email,
  name:      c.attributes.name ?? '',
  created_at: new Date().toISOString(),
  last_login: new Date().toISOString(),
});

export const useAuth = () => {
  /* -------------------------------------------------------------------- */
  /* state                                                                 */
  /* -------------------------------------------------------------------- */
  const [user,  setUser]        = useState<User | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  /* -------------------------------------------------------------------- */
  /* helpers                                                               */
  /* -------------------------------------------------------------------- */
  const refreshUser = useCallback(async () => {
    try {
      const cUser = await Auth.currentAuthenticatedUser();
      setUser(map(cUser));
    } catch { setUser(null); }
    setLoading(false);
  }, []);

  /* run once on mount */
  useEffect(() => { refreshUser(); }, [refreshUser]);

  /* -------------------------------------------------------------------- */
  /* actions                                                               */
  /* -------------------------------------------------------------------- */
  const signUp = async (email: string, pwd: string, name: string) => {
    setLoading(true); setError(null);
    try {
      await Auth.signUp({ username: email, password: pwd, attributes: { email, name } });
      /* user must now confirm OTP */
      setNeedsConfirm(true);
      return true;
    } catch (e: any) { setError(e.message); return false; }
    finally          { setLoading(false); }
  };

  const confirmSignUp = async (email: string, code: string) => {
    setLoading(true); setError(null);
    try {
      await Auth.confirmSignUp(email, code);
      setNeedsConfirm(false);
      await signIn(email, undefined);          // ask for pwd again → sign-in view
      return true;
    } catch (e: any) { setError(e.message); return false; }
    finally          { setLoading(false); }
  };

  const resend = async (email: string) => Auth.resendSignUp(email);

  const signIn = async (email: string, pwd?: string) => {
    setLoading(true); setError(null);
    try {
      const cUser = await Auth.signIn(email, pwd);
      setUser(map(cUser));
      return true;
    } catch (e: any) {
      if (e.code === 'UserNotConfirmedException') setNeedsConfirm(true);
      setError(e.message); return false;
    } finally { setLoading(false); }
  };

  const signOut = async () => { await Auth.signOut(); setUser(null); };

  /* -------------------------------------------------------------------- */
  /* expose                                                                */
  /* -------------------------------------------------------------------- */
  return {
    user, loading, error, needsConfirm,
    signUp, confirmSignUp, resendConfirmationCode: resend,
    signIn, signOut,
  } as const;
};
