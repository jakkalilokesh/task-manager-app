import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
} from 'lucide-react';

interface AuthProps {
  onSignIn:       (e: string, p: string)                => Promise<boolean>;
  onSignUp:       (e: string, p: string, n: string)     => Promise<boolean>;
  confirmSignUp:  (e: string, code: string)             => Promise<boolean>;
  resendCode:     (e: string)                           => Promise<void>;
  needsConfirm:   boolean;
  loading:        boolean;
  error:          string | null;
}

export const Auth: React.FC<AuthProps> = ({
  onSignIn,
  onSignUp,
  confirmSignUp,
  resendCode,
  needsConfirm,
  loading,
  error,
}) => {
  /* ───────── Local UI state ───────── */
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const [otp, setOtp]           = useState('');

  /* store the email used during signup (or unconfirmed signin) */
  const [verifyEmail, setVerifyEmail] = useState<string>('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  /* ───────── Validation helper ───────── */
  const validateForm = () => {
    const e: Record<string, string> = {};
    const { email, password, name, confirmPassword } = formData;

    if (!email) e.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email';

    if (!password) e.password = 'Password required';
    else if (password.length < 6) e.password = 'Min 6 characters';

    if (isSignUp) {
      if (!name) e.name = 'Name required';
      if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ───────── Submit handler ───────── */
  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateForm()) return;

    const { email, password, name } = formData;

    if (isSignUp) {
      const ok = await onSignUp(email, password, name);
      if (ok) {
        setVerifyEmail(email);        // 🔐 save email for OTP
      }
    } else {
      const ok = await onSignIn(email, password);
      if (ok && needsConfirm) {
        setVerifyEmail(email);        // 🔐 save unconfirmed signin email
      }
    }
  };

  /* ───────── OTP handlers ───────── */
  const handleVerifyOtp = async () => {
    if (!otp) return;
    await confirmSignUp(verifyEmail || formData.email, otp);
    setOtp('');
  };
  const handleResend = async () => {
    await resendCode(verifyEmail || formData.email);
  };

  /* auto‐save email when needsConfirm flips true */
  useEffect(() => {
    if (needsConfirm && !verifyEmail) setVerifyEmail(formData.email);
  }, [needsConfirm]);

  /* ───────── JSX ───────── */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TaskFlow
            </h1>
          </div>
          <h2 className="text-xl font-semibold mt-4">
            {needsConfirm ? 'Verify your email' : isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
        </div>

        {/* AWS banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex space-x-2 text-sm">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <span>Authentication powered by AWS Cognito</span>
        </div>

        {/* Form / OTP */}
        <div className="bg-white rounded-xl shadow p-6">
          {/* ---------- OTP Block ---------- */}
          {needsConfirm ? (
            <div className="space-y-4">
              <input
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
              />
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded"
              >
                Verify OTP
              </button>
              <button
                onClick={handleResend}
                className="w-full text-sm text-blue-600 underline"
              >
                Resend Code
              </button>
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            </div>
          ) : (
            /* ---------- Sign In / Sign Up form ---------- */
            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div>
                  <label className="text-sm">Name</label>
                  <input
                    className="w-full px-3 py-2 border rounded"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                  {formErrors.name && <p className="text-xs text-red-600">{formErrors.name}</p>}
                </div>
              )}

              <div>
                <label className="text-sm">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border rounded"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
                {formErrors.email && <p className="text-xs text-red-600">{formErrors.email}</p>}
              </div>

              <div>
                <label className="text-sm">Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className="w-full px-3 py-2 border rounded"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-2 top-2 text-gray-500"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {formErrors.password && <p className="text-xs text-red-600">{formErrors.password}</p>}
              </div>

              {isSignUp && (
                <div>
                  <label className="text-sm">Confirm Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border rounded"
                    value={formData.confirmPassword}
                    onChange={e =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                  />
                  {formErrors.confirmPassword && (
                    <p className="text-xs text-red-600">{formErrors.confirmPassword}</p>
                  )}
                </div>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                {loading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-t-transparent rounded-full" />
                ) : (
                  <>
                    {isSignUp ? 'Sign Up' : 'Sign In'} <ArrowRight size={16} className="ml-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle link (only when not confirming) */}
          {!needsConfirm && (
            <div className="text-center mt-4">
              <button
                className="text-blue-600 underline text-sm"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setFormErrors({});
                }}
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App; // ✅ This must be present