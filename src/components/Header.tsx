import React from 'react';
import { User, BookOpen, LogOut, Settings } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  user: UserType;
  currentView: 'dashboard' | 'tasks' | 'account';        // give it a union type
  onChangeView: (view: 'dashboard' | 'tasks' | 'account') => void;   // 👈 renamed
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentView,
  onChangeView,           // 👈 renamed
  onSignOut,
}) => {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TaskFlow
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <button
              onClick={() => onChangeView('dashboard')}
              className={`font-medium ${
                currentView === 'dashboard' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onChangeView('tasks')}
              className={`font-medium ${
                currentView === 'tasks' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => onChangeView('account')}
              className={`font-medium ${
                currentView === 'account' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Account
            </button>

            {/* Right‐side user / sign-out */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 flex items-center space-x-1">
                <User className="w-5 h-5" />
                <span className="text-sm">{user.name || user.email}</span>
              </span>
              <button
                onClick={onSignOut}
                className="text-gray-500 hover:text-red-600 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
