import React, { useState } from 'react';

interface ConfirmCodeProps {
  email: string;
  onConfirm: (code: string) => void;
  onResend: () => void;
  error: string | null;
}

export const ConfirmCode: React.FC<ConfirmCodeProps> = ({
  email,
  onConfirm,
  onResend,
  error,
}) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(code);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">Confirm Your Account</h2>
      <p className="text-sm text-gray-600 mb-4">
        A confirmation code was sent to <strong>{email}</strong>. Please enter it below.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter confirmation code"
          className="w-full border border-gray-300 rounded px-4 py-2"
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Confirm Account
        </button>
        <button
          type="button"
          onClick={onResend}
          className="text-blue-500 text-sm hover:underline"
        >
          Resend Code
        </button>
      </form>
    </div>
  );
};
