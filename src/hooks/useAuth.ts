import { useState, useEffect, useCallback } from 'react';
import { Auth } from 'aws-amplify';
import { User } from '../types';

/* ───────── helpers ───────── */
const mapUser = (c: any): User => ({
  id: c.attributes?.sub ?? c.Username,
  email: c.attributes?.email ?? c.username,
  name: c.attributes?.name ?? '',
  created_at: c.attributes?.created_at ?? new Date().toISOString(),
  last_login: new Date().toISOString(),
});

const prettyError = (e: any): string => {
  switch (e.code) {
    case 'UserNotConfirmedException':
      return 'Your account is not verified. Please check your email.';
    case 'UsernameExistsException':
      return 'This email is already registered. Please sign in.';
    case 'NotAuthorizedException':
      return 'Incorrect credentials. Please try again.';
    case 'UserNotFoundException':
      return 'User not found.';
    case 'CodeMismatchException':
      return 'Invalid verification code.';
    case 'ExpiredCodeException':
      return 'Code expired. Please request a new one.';
    default:
      return e.message || 'Authentication error. Please try again.';
  }
};

/* ───────── main hook ───────── */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const current = await Auth.currentAuthenticatedUser();
      setUser(mapUser(current));
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  /* ───────── actions ───────── */
  const signUp = async (email: string, pwd: string, name: string) => {
    setLoading(true); setError(null);
    try {
      await Auth.signUp({ username: email, password: pwd, attributes: { email, name } });
      setNeedsConfirm(true);
      return true;
    } catch (e: any) {
      setError(prettyError(e)); return false;
    } finally { setLoading(false); }
  };

  const confirmSignUp = async (email: string, code: string) => {
    setLoading(true); setError(null);
    try {
      await Auth.confirmSignUp(email, code);
      setNeedsConfirm(false);                 // no auto-login, user will sign in manually
      return true;
    } catch (e: any) {
      setError(prettyError(e)); return false;
    } finally { setLoading(false); }
  };

  const resendConfirmationCode = async (email: string) => {
    try { await Auth.resendSignUp(email); }
    catch (e: any) { setError(prettyError(e)); }
  };

  const signIn = async (email: string, pwd?: string) => {
    setLoading(true); setError(null);
    try {
      await Auth.signIn(email, pwd);
      const current = await Auth.currentAuthenticatedUser();
      setUser(mapUser(current));
      return true;
    } catch (e: any) {
      if (e.code === 'UserNotConfirmedException') setNeedsConfirm(true);
      setError(prettyError(e)); return false;
    } finally { setLoading(false); }
  };

  const signOut = async () => {
    try { await Auth.signOut({ global: true }); }
    finally {
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
    }
  };

  return {
    user, loading, error, needsConfirm,
    signUp, confirmSignUp, resendConfirmationCode,
    signIn, signOut, refreshUser,
  } as const;
};
