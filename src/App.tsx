// src/App.tsx
import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { Auth } from './components/Auth';
import { Header } from './components/Header';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import { Account } from './components/Account';

function App() {
  /* authentication ----------------------------------------------------- */
  const { user, loading: authLoading, signOut } = useAuth();
  /* simple in-memory navigation --------------------------------------- */
  const [view, setView] = useState<'dashboard' | 'tasks' | 'account'>('dashboard');

  /* splash while checking session ------------------------------------- */
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  /* not signed-in → show Auth screen ---------------------------------- */
  if (!user) return <Auth />;

  /* signed-in → render app -------------------------------------------- */
  const render = () => {
    switch (view) {
      case 'dashboard': return <Dashboard />;
      case 'tasks':     return <TaskList />;
      case 'account':   return <Account user={user} />;
      default:          return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header
        user={user}
        currentView={view}
        onChangeView={setView}
        onSignOut={signOut}
      />
      <main className="px-4 sm:px-6 lg:px-8 py-6">{render()}</main>
    </div>
  );
}

export default App;
