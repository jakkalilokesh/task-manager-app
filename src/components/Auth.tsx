// src/components/Auth.tsx
import React, { useState } from 'react';
import {
  Mail, Lock, User, Eye, EyeOff, ArrowRight, Shield,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

/* ------------------------------------------------------- */
/* Confirm-Code sub-component                              */
/* ------------------------------------------------------- */
interface ConfirmCodeProps {
  email: string;
  onBack: () => void;
}

const ConfirmCode: React.FC<ConfirmCodeProps> = ({ email, onBack }) => {
  const { confirmSignUp, signIn, resendConfirmationCode, error, loading } = useAuth();
  const [code, setCode] = useState('');
  const [pwd, setPwd] = useState('');               // for auto-login

  const handleVerify = async () => {
    const ok = await confirmSignUp(email, code);
    if (ok) {
      // 🔐 auto-login
      await signIn(email, pwd);
    }
  };

  return (
    <>
      <h2 className="text-xl font-semibold mt-4">Verify your e-mail</h2>

      <div className="mt-6 space-y-4">
        <input
          className="w-full px-3 py-2 border rounded"
          placeholder="Verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <input
          type="password"
          className="w-full px-3 py-2 border rounded"
          placeholder="Password (for auto-login)"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={handleVerify}
          disabled={loading || code.length === 0 || pwd.length === 0}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? 'Verifying…' : 'Verify & sign in'}
        </button>

        <button
          onClick={() => resendConfirmationCode(email)}
          className="text-sm text-blue-600 underline"
        >
          Resend code
        </button>

        <button
          onClick={onBack}
          className="text-sm text-gray-500 underline block mt-4"
        >
          Back to sign-in
        </button>
      </div>
    </>
  );
};

/* ------------------------------------------------------- */
/* Main Auth component                                     */
/* ------------------------------------------------------- */
export const Auth: React.FC = () => {
  const {
    signUp, signIn, needsConfirm, error, loading,
  } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '', name: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const handleChange = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  /* -------------------------------- sign-up / sign-in submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      if (form.password !== form.confirmPassword) return;
      const ok = await signUp(form.email, form.password, form.name);
      if (ok) setPendingEmail(form.email);
    } else {
      await signIn(form.email, form.password);
    }
  };

  /* -------------------------------- UI */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-md p-8">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold">TaskFlow</h1>
        </div>

        {/* ---------- confirm code mode ---------- */}
        {needsConfirm && pendingEmail ? (
          <ConfirmCode email={pendingEmail} onBack={() => setIsSignUp(false)} />
        ) : (
          /* ---------- sign-in / sign-up form ---------- */
          <>
            <h2 className="text-xl font-semibold">
              {isSignUp ? 'Create account' : 'Welcome back'}
            </h2>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {isSignUp && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    placeholder="Full name"
                    className="w-full pl-10 pr-3 py-2 border rounded"
                    value={form.name}
                    onChange={handleChange('name')}
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-2 border rounded"
                  value={form.email}
                  onChange={handleChange('email')}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-2 border rounded"
                  value={form.password}
                  onChange={handleChange('password')}
                />
                {showPwd ? (
                  <EyeOff onClick={() => setShowPwd(false)} className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 cursor-pointer text-gray-400" />
                ) : (
                  <Eye onClick={() => setShowPwd(true)} className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 cursor-pointer text-gray-400" />
                )}
              </div>

              {isSignUp && (
                <input
                  required
                  type="password"
                  placeholder="Confirm password"
                  className="w-full px-3 py-2 border rounded"
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                />
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded flex items-center justify-center"
              >
                {loading ? 'Please wait…' : (
                  <>
                    {isSignUp ? 'Create account' : 'Sign in'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>

            {/* Switch link */}
            <button
              className="mt-6 text-sm text-blue-600 hover:underline"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
