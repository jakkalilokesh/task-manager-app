import React, { useState } from 'react';
import {
  Mail, Lock, User, Eye, EyeOff, Shield, ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';     // ← NEW
import { useAuth } from '../hooks/useAuth';

/* ━━━ Confirm-code sub-component ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const ConfirmCode: React.FC<{ email: string; onBack: () => void }> = ({
  email,
  onBack,
}) => {
  const { confirmSignUp, resendConfirmationCode, error, loading } = useAuth();
  const [code, setCode] = useState('');

  return (
    <>
      <h2 className="text-xl font-semibold text-center mb-6">
        Verify Your Email
      </h2>

      <input
        placeholder="Confirmation code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
      />

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <button
        disabled={!code || loading}
        onClick={() =>
          confirmSignUp(email, code).then((ok) => ok && onBack())
        }
        className="w-full bg-blue-600 text-white py-2 rounded mt-4 hover:brightness-110 transition"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin border-t-2 border-white rounded-full h-4 w-4 mr-2" />
            Verifying…
          </span>
        ) : (
          'Verify & Continue'
        )}
      </button>

      <button
        onClick={() => resendConfirmationCode(email)}
        className="block mt-4 text-sm text-blue-600 underline"
      >
        Resend code
      </button>

      <button
        onClick={onBack}
        className="block mt-2 text-sm text-gray-500 underline"
      >
        Back to Sign-in
      </button>
    </>
  );
};

/* ━━━ Auth main component ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const Auth: React.FC = () => {
  const { signUp, signIn, needsConfirm, error, loading } = useAuth();
  const navigate = useNavigate();                           // ← NEW

  /* form state */
  const [isUp, setIsUp]       = useState(false);
  const [form, setForm]       = useState({ email: '', password: '', confirm: '', name: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [pending, setPending] = useState('');

  const change =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    /* ─ sign-up ─ */
    if (isUp) {
      if (form.password !== form.confirm) return;
      const ok = await signUp(form.email, form.password, form.name);
      if (ok) setPending(form.email);
      return;
    }
    /* ─ sign-in ─ */
    const ok = await signIn(form.email, form.password);
    if (ok) navigate('/dashboard', { replace: true });      // ← NEW redirect
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center
                 bg-gradient-to-br from-indigo-50 via-white to-purple-50
                 bg-[length:400%_400%] animate-[bgShift_15s_ease_infinite] font-inter"
    >
      <style>{`
        @keyframes bgShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="w-[95%] sm:w-[380px] bg-white/70 backdrop-blur
                   border border-white/30 shadow-2xl rounded-2xl p-8"
      >
        <div className="w-12 h-12 mx-auto flex items-center justify-center
                        rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 mb-6 shadow">
          <Shield size={22} className="text-white" />
        </div>

        {needsConfirm && pending ? (
          <ConfirmCode
            email={pending}
            onBack={() => {
              setPending('');
              setIsUp(false);
            }}
          />
        ) : (
          <>
            <h2 className="text-center text-2xl font-semibold mb-6">
              {isUp ? 'Create Account' : 'Welcome Back'}
            </h2>

            {error && (
              <div className="mb-4 px-3 py-2 bg-red-50 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              {isUp && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    required
                    placeholder="Full name"
                    value={form.name}
                    onChange={change('name')}
                    className="w-full pl-10 pr-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={change('email')}
                  className="w-full pl-10 pr-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  required
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Password"
                  value={form.password}
                  onChange={change('password')}
                  className="w-full pl-10 pr-10 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
                {showPwd ? (
                  <EyeOff
                    onClick={() => setShowPwd(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" size={16}
                  />
                ) : (
                  <Eye
                    onClick={() => setShowPwd(true)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" size={16}
                  />
                )}
              </div>

              {isUp && (
                <input
                  required
                  type="password"
                  placeholder="Confirm password"
                  value={form.confirm}
                  onChange={change('confirm')}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              )}

              <button
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:brightness-110 transition flex justify-center"
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin border-t-2 border-white rounded-full h-4 w-4 mr-2" />
                    Please wait…
                  </span>
                ) : (
                  <>
                    {isUp ? 'Create account' : 'Sign in'}
                    <ArrowRight size={16} className="ml-2" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              <button
                onClick={() => setIsUp(!isUp)}
                className="text-sm text-blue-600 hover:underline transition"
              >
                {isUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
