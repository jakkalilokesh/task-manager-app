import { useState, useEffect, useCallback } from 'react';
import { Auth } from 'aws-amplify';
import { User } from '../types';

/* map Cognito → local shape */
const map = (c: any): User => ({
  id: c.attributes.sub,
  email: c.attributes.email,
  name: c.attributes.name ?? '',
  created_at: new Date().toISOString(),
  last_login: new Date().toISOString(),
});

export const useAuth = () => {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  /* fetch session once */
  const refresh = useCallback(async () => {
    try {
      const c = await Auth.currentAuthenticatedUser();
      setUser(map(c));
    } catch { setUser(null); }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  /* pretty error */
  const pe = (e: any) => {
    if (e.code === 'UserNotConfirmedException') setNeedsConfirm(true);
    return e.message || 'Auth error';
  };

  /* API */
  const signUp = async (email: string, pwd: string, name: string) => {
    setLoading(true); setError(null);
    try {
      await Auth.signUp({ username: email, password: pwd, attributes: { email, name } });
      setNeedsConfirm(true);
      return true;
    } catch (e: any) { setError(pe(e)); return false; }
    finally { setLoading(false); }
  };

  const confirmSignUp = async (email: string, code: string) => {
    setLoading(true); setError(null);
    try {
      await Auth.confirmSignUp(email, code);
      setNeedsConfirm(false);
      return true;
    } catch (e: any) { setError(pe(e)); return false; }
    finally { setLoading(false); }
  };

  const signIn = async (email: string, pwd: string) => {
    setLoading(true); setError(null);
    try {
      await Auth.signIn(email, pwd);
      const c = await Auth.currentAuthenticatedUser();
      setUser(map(c));           // ★ ensures user is populated
      return true;
    } catch (e: any) { setError(pe(e)); return false; }
    finally { setLoading(false); }
  };

  const signOut = async () => { await Auth.signOut({ global:true }); setUser(null); };

  return {
    user, loading, error, needsConfirm,
    signUp, confirmSignUp, signIn, signOut,
    resendConfirmationCode: (e:string) => Auth.resendSignUp(e),
  } as const;
};
