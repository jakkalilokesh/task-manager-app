import React, { useState } from 'react';

interface Props {
  email: string;
  onConfirm: (code: string, password: string) => void;
  onResend: () => void;
  onBack: () => void;
  error: string | null;
  loading: boolean;
}

export const ConfirmCode: React.FC<Props> = ({
  email, onConfirm, onResend, onBack, error, loading,
}) => {
  const [code, setCode] = useState('');
  const [pwd, setPwd] = useState('');

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
          placeholder="Your password (for sign-in)"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={() => onConfirm(code, pwd)}
          disabled={loading || !code || !pwd}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? 'Verifying…' : 'Verify & sign in'}
        </button>

        <button
          onClick={onResend}
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
