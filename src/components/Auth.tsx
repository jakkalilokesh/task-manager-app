import React, { useState } from 'react';
import {
  Mail, Lock, User, Eye, EyeOff, Shield, ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/* --- confirm code --- */
const Confirm: React.FC<{ email: string; done: () => void }> = ({ email, done }) => {
  const { confirmSignUp, resendConfirmationCode, error, loading } = useAuth();
  const [code, setCode] = useState('');
  return (
    <>
      <h2 className="text-xl font-semibold text-center mb-6">Verify Email</h2>
      <input
        className="w-full px-4 py-2 border rounded"
        placeholder="Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      <button
        onClick={() => confirmSignUp(email, code).then(ok => ok && done())}
        disabled={!code || loading}
        className="w-full bg-blue-600 text-white py-2 rounded mt-4"
      >
        {loading ? 'Verifying…' : 'Verify'}
      </button>
      <button
        onClick={() => resendConfirmationCode(email)}
        className="block mt-4 text-sm text-blue-600 underline"
      >Resend code</button>
    </>
  );
};

/* --- auth card --- */
const Auth: React.FC = () => {
  const { signUp, signIn, needsConfirm, error, loading } = useAuth();
  const nav = useNavigate();

  const [signUpMode, setSignUpMode] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', pass:'', confirm:'' });
  const [codeEmail, setCodeEmail] = useState('');

  const input = (k:keyof typeof form)=>(e:React.ChangeEvent<HTMLInputElement>) =>
    setForm({...form,[k]:e.target.value});

  const submit = async (e:React.FormEvent) => {
    e.preventDefault();
    if (signUpMode) {
      if (form.pass !== form.confirm) return;
      const ok = await signUp(form.email, form.pass, form.name);
      if (ok) setCodeEmail(form.email);
    } else {
      const ok = await signIn(form.email, form.pass);
      if (ok) nav('/dashboard', { replace:true });   // ★ redirect on success
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center
                    bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <motion.div
        initial={{ opacity:0, y:30 }} animate={{opacity:1, y:0}}
        className="w-[380px] bg-white/70 backdrop-blur rounded-2xl shadow-2xl
                   border border-white/30 p-8"
      >
        <div className="w-12 h-12 mx-auto flex items-center justify-center
                        rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 mb-6">
          <Shield size={22} className="text-white" />
        </div>

        {needsConfirm && codeEmail ? (
          <Confirm email={codeEmail} done={()=>{setCodeEmail(''); setSignUpMode(false);}} />
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-center mb-6">
              {signUpMode ? 'Create Account' : 'Welcome Back'}
            </h2>

            {error && <div className="mb-4 px-3 py-2 bg-red-50 text-red-700 rounded">{error}</div>}

            <form onSubmit={submit} className="space-y-4">
              {signUpMode && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                  <input
                    required
                    placeholder="Full name"
                    value={form.name}
                    onChange={input('name')}
                    className="w-full pl-10 pr-3 py-2 border rounded"
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input
                  required type="email" placeholder="Email"
                  value={form.email} onChange={input('email')}
                  className="w-full pl-10 pr-3 py-2 border rounded"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input
                  required type="password" placeholder="Password"
                  value={form.pass} onChange={input('pass')}
                  className="w-full pl-10 pr-3 py-2 border rounded"
                />
              </div>
              {signUpMode && (
                <input
                  required type="password" placeholder="Confirm"
                  value={form.confirm} onChange={input('confirm')}
                  className="w-full px-3 py-2 border rounded"
                />
              )}

              <button
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded flex justify-center"
              >
                {loading ? 'Please wait…' :
                  <> {signUpMode ? 'Create account':'Sign in'} <ArrowRight size={16} className="ml-2"/> </>}
              </button>
            </form>

            <div className="text-center mt-6">
              <button onClick={()=>setSignUpMode(!signUpMode)}
                      className="text-sm text-blue-600 underline">
                {signUpMode
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
