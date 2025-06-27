// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { Auth } from 'aws-amplify';
import awsConfig from '../config/aws-config';
import { User } from '../types';

/* ------------------------------------------------------------------ */
/* Amplify is configured globally in aws-config.ts                    */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
const mapUser = (c: any): User => ({
  id: c.attributes?.sub ?? c.Username,
  email: c.attributes?.email ?? c.username,
  name: c.attributes?.name ?? '',
  created_at: new Date().toISOString(),
  last_login: new Date().toISOString(),
});

const prettyError = (e: any): string => {
  switch (e.code) {
    case 'UserNotConfirmedException':
      return 'Your account is not verified. Please check your e‑mail for the confirmation code.';
    case 'NotAuthorizedException':
      return 'Incorrect credentials. Please try again.';
    case 'UserNotFoundException':
      return 'No user found with this e‑mail.';
    case 'CodeMismatchException':
      return 'The verification code is invalid.';
    case 'ExpiredCodeException':
      return 'The verification code has expired. Please request a new one.';
    default:
      return e.message || 'Authentication error. Please try again.';
  }
};

/* ------------------------------------------------------------------ */
/* Hook                                                               */
/* ------------------------------------------------------------------ */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  /* Fetch current session */
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

  /* ------------------------------------------------------------------ */
  /* Actions                                                            */
  /* ------------------------------------------------------------------ */
  const signUp = async (email: string, pwd: string, name: string) => {
    setLoading(true); setError(null);
    try {
      await Auth.signUp({ username: email, password: pwd, attributes: { email, name } });
      setNeedsConfirm(true);
      return true;
    } catch (e: any) {
      setError(prettyError(e));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const confirmSignUp = async (email: string, code: string) => {
    setLoading(true); setError(null);
    try {
      await Auth.confirmSignUp(email, code);
      setNeedsConfirm(false);
      return true;
    } catch (e: any) {
      setError(prettyError(e));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmationCode = (email: string) => Auth.resendSignUp(email);

  const signIn = async (email: string, pwd?: string) => {
    setLoading(true); setError(null);
    try {
      await Auth.signIn(email, pwd);
      const current = await Auth.currentAuthenticatedUser();
      setUser(mapUser(current));
      return true;
    } catch (e: any) {
      if (e.code === 'UserNotConfirmedException') setNeedsConfirm(true);
      setError(prettyError(e));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await Auth.signOut({ global: true });
    setUser(null);
  };

  /* ------------------------------------------------------------------ */
  return {
    user,
    loading,
    error,
    needsConfirm,
    signUp,
    confirmSignUp,
    resendConfirmationCode,
    signIn,
    signOut,
    refreshUser,
  } as const;
};