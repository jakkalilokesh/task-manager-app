import { useState, useEffect, useCallback } from 'react';
import { Auth } from 'aws-amplify';
import { User } from '../types';

const mapUser = (c: any): User => ({
  id: c.attributes?.sub ?? c.username,
  email: c.attributes?.email ?? c.username,
  name: c.attributes?.name ?? '',
  created_at: new Date().toISOString(),
  last_login: new Date().toISOString(),
});

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

  const prettyError = (e: any): string => {
    switch (e.code) {
      case 'UserNotConfirmedException':
        setNeedsConfirm(true);
        return 'Account not verified – check your email';
      case 'UsernameExistsException':
        return 'Email already registered. Sign in or verify account.';
      case 'NotAuthorizedException':
        return 'Incorrect credentials';
      default:
        return e.message || 'Authentication error';
    }
  };

  const signUp = async (email: string, pwd: string, name: string) => {
    setLoading(true);
    setError(null);
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
    setLoading(true);
    setError(null);
    try {
      await Auth.confirmSignUp(email, code);
      return true;
    } catch (e: any) {
      setError(prettyError(e));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, pwd: string) => {
    setLoading(true);
    setError(null);
    try {
      await Auth.signIn(email, pwd);
      const current = await Auth.currentAuthenticatedUser();
      setUser(mapUser(current));
      return true;
    } catch (e: any) {
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

  return {
    user,
    loading,
    error,
    needsConfirm,
    signUp,
    confirmSignUp,
    signIn,
    signOut,
    resendConfirmationCode: (email: string) => Auth.resendSignUp(email),
    refreshUser,
  } as const;
};
