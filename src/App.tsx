// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import { Account } from './components/Account';
import { Header } from './components/Header';

const App: React.FC = () => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {user && <Header user={user} onSignOut={signOut} />}
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
        <Route path="/dashboard" element={user ? <Dashboard tasks={[]} /> : <Navigate to="/auth" />} />
        <Route path="/tasks" element={user ? <TaskList tasks={[]} loading={false} onCreate={()=>{}} onUpdate={()=>{}} onDelete={()=>{}} /> : <Navigate to="/auth" />} />
        <Route path="/account" element={user ? <Account user={user} /> : <Navigate to="/auth" />} />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/auth'} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
