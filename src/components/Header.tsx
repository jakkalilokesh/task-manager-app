import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';

interface Props {
  user: User;
  onSignOut: () => void;
}

export const Header: React.FC<Props> = ({ user, onSignOut }) => {
  const loc = useLocation();
  const active = (p: string) =>
    loc.pathname.startsWith(p) ? 'text-blue-600 font-semibold' : 'text-gray-700';

  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <span className="text-xl font-bold">TaskFlow</span>

      <nav className="space-x-6">
        <Link className={active('/dashboard')} to="/dashboard">Dashboard</Link>
        <Link className={active('/tasks')}      to="/tasks">Tasks</Link>
        <Link className={active('/account')}    to="/account">Account</Link>
      </nav>

      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">{user.email}</span>
        <button onClick={onSignOut} className="text-red-600 hover:underline">Sign out</button>
      </div>
    </header>
  );
};
