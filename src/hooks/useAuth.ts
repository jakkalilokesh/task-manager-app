// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { Auth } from 'aws-amplify';
import { User } from '../types';

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
      return 'Your account is not verified. Please check your email for the confirmation code.';
    case 'UsernameExistsException':
      return 'This email is already registered. Please sign in or confirm your account.';
    case 'NotAuthorizedException':
      return 'Incorrect credentials. Please try again.';
    case 'UserNotFoundException':
      return 'No user found with this email.';
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

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const signUp = async (email: string, pwd: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      await Auth.signUp({
        username: email,
        password: pwd,
        attributes: { email, name }
      });
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
    setLoading(true);
    setError(null);
    try {
      await Auth.confirmSignUp(email, code);
      setNeedsConfirm(false);
      await signIn(email); // Auto-login after confirmation
      return true;
    } catch (e: any) {
      setError(prettyError(e));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmationCode = async (email: string) => {
    try {
      await Auth.resendSignUp(email);
    } catch (e: any) {
      setError(prettyError(e));
    }
  };

  const signIn = async (email: string, pwd?: string) => {
    setLoading(true);
    setError(null);
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
    try {
      await Auth.signOut({ global: true });
    } catch (e: any) {
      console.warn('Sign out failed:', e);
    }
    setUser(null);
  };

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
