// src/components/Auth.tsx
import React, { useState } from 'react';
import {
  Mail, Lock, User, Eye, EyeOff, ArrowRight, Shield,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

/* ───────────────── Confirm-Code ───────────────── */
interface ConfirmCodeProps {
  email: string;
  onBack: () => void;
}
const ConfirmCode: React.FC<ConfirmCodeProps> = ({ email, onBack }) => {
  const { confirmSignUp, resendConfirmationCode, error, loading } = useAuth();
  const [code, setCode] = useState('');

  const handleVerify = async () => {
    const ok = await confirmSignUp(email, code);
    if (ok) onBack();                       // go back to sign-in manually
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center">Verify your email</h2>

      <input
        className="w-full px-3 py-2 border rounded"
        placeholder="Verification code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleVerify}
        disabled={loading || code.length === 0}
        className="w-full bg-blue-600 text-white py-2 rounded hover:brightness-110 transition"
      >
        {loading ? 'Verifying…' : 'Verify'}
      </button>

      <button
        onClick={() => resendConfirmationCode(email)}
        className="text-sm text-blue-600 underline block"
      >
        Resend code
      </button>

      <button
        onClick={onBack}
        className="text-sm text-gray-500 underline block"
      >
        Back to Sign-in
      </button>
    </div>
  );
};

/* ───────────────── Auth main ───────────────── */
export const Auth: React.FC = () => {
  const {
    signUp, signIn, needsConfirm, error, loading,
  } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', name: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const handleChange = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      if (form.password !== form.confirmPassword) return;
      const ok = await signUp(form.email, form.password, form.name);
      if (ok) setPendingEmail(form.email);      // trigger ConfirmCode mode
    } else {
      await signIn(form.email, form.password);
    }
  };

  /* helper for Back-to-sign-in */
  const resetToSignIn = () => {
    setPendingEmail('');
    setIsSignUp(false);
  };

  /* ────────────── UI ────────────── */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 font-inter">
      <div className="flex shadow-xl bg-white rounded-xl overflow-hidden w-full max-w-4xl">
        {/* Illustration */}
        <motion.div
          className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-tr from-blue-500 to-purple-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src="https://undraw.co/api/illustrations/69fcac43-f64b-4e7e-bf39-417fe97c5bc2"
            alt="Student planning illustration"
            className="w-3/4 object-contain"
          />
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full md:w-1/2 p-8"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold">TaskFlow</h1>
          </div>

          {/* Confirm-code view */}
          {needsConfirm && pendingEmail ? (
            <ConfirmCode email={pendingEmail} onBack={resetToSignIn} />
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-1">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {isSignUp ? 'Manage tasks like a pro student!' : 'Sign in to manage your tasks.'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full bg-blue-600 text-white py-2 rounded flex items-center justify-center transition hover:brightness-110"
                >
                  {loading ? 'Please wait…' : (
                    <>
                      {isSignUp ? 'Create account' : 'Sign in'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </form>

              <button
                className="mt-6 text-sm text-blue-600 hover:underline"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
