// src/components/Auth.tsx
import React, { useState } from 'react';
import {
  Mail, Lock, User, Eye, EyeOff, Shield, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Auth: React.FC = () => {
  const {
    signUp, confirmSignUp, signIn, resendConfirmationCode,
    needsConfirm, error, loading,
  } = useAuth();

  /* ------------------------------------------------------------------ */
  /* local state                                                        */
  /* ------------------------------------------------------------------ */
  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', name: '', confirmPassword: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [otp, setOtp] = useState('');

  /** e-mail we still have to verify */
  const [pendingEmail, setPendingEmail] = useState('');

  /* ------------------------------------------------------------------ */
  /* handlers                                                           */
  /* ------------------------------------------------------------------ */
  const handleChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  /** main form submit (sign-up or sign-in) */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      if (form.password !== form.confirmPassword) return;
      const ok = await signUp(form.email, form.password, form.name);
      if (ok) setPendingEmail(form.email);                // remember for OTP
    } else {
      const ok = await signIn(form.email, form.password);

      /* sign-in failed because user not confirmed → remember e-mail */
      if (!ok && needsConfirm) setPendingEmail(form.email);
    }
  };

  /** verify OTP */
  const handleVerify = async () => {
    if (!pendingEmail) return;
    await confirmSignUp(pendingEmail, otp);
  };

  /** resend code */
  const handleResend = async () => {
    if (!pendingEmail) return;
    await resendConfirmationCode(pendingEmail);
    alert('Verification code sent again.');
  };

  /* ------------------------------------------------------------------ */
  /* UI                                                                 */
  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-md">
        <div className="p-8">
          {/* heading */}
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold">TaskFlow</h1>
          </div>
          <h2 className="text-xl font-semibold mt-4">
            {needsConfirm ? 'Verify your e-mail' : isSignUp ? 'Create account' : 'Welcome back'}
          </h2>

          {/* ============ 1) SIGN-UP / SIGN-IN FORM ============ */}
          {!needsConfirm && (
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

              {/* email */}
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

              {/* password */}
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

              {/* confirm pwd */}
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

              {/* error */}
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
          )}

          {/* ============ 2) OTP VERIFICATION FORM ============ */}
          {needsConfirm && (
            <div className="mt-6 space-y-4">
              <input
                autoFocus
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter verification code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button
                onClick={handleVerify}
                disabled={loading || otp.length === 0}
                className="w-full bg-blue-600 text-white py-2 rounded"
              >
                {loading ? 'Verifying…' : 'Verify & continue'}
              </button>
              <button
                onClick={handleResend}
                disabled={!pendingEmail || loading}
                className="text-sm text-blue-600 underline"
              >
                Resend code
              </button>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          )}

          {/* switch link */}
          {!needsConfirm && (
            <button
  className="text-sm text-blue-600 hover:underline"
  onClick={() => setIsSignUp(!isSignUp)}
>
  {isSignUp
    ? 'Already have an account? Sign in'
    : "Don't have an account? Sign up"}
</button>

          )}
        </div>
      </div>
    </div>
  );
};
