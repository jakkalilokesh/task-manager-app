import React from 'react';
import { User as UserIcon, List, Grid } from 'lucide-react';
import { User } from '../types';

interface Props {
  user: User;
  onSignOut: () => void;
}

export const Header: React.FC<Props> = ({ user, onSignOut }) => (
  <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
    <div className="flex items-center space-x-4">
      <h1 className="text-xl font-bold">TaskFlow</h1>
      <span className="px-3 py-1 rounded bg-blue-100 text-blue-700">{user.email}</span>
    </div>
    <button onClick={onSignOut} className="text-red-600 hover:underline">
      Sign Out
    </button>
  </header>
);
