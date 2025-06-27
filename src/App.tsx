import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import { Header } from './components/Header';

const App: React.FC = () => {
  const { user, loading, signOut } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center"><span>Loading…</span></div>;

  return (
    <BrowserRouter>
      {user && <Header user={user} onSignOut={signOut} />}
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth />} />
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/auth" />} />
        <Route path="/dashboard" element={user ? <Dashboard tasks={[]} /> : <Navigate to="/auth" />} />
        <Route path="/tasks" element={user ? <TaskList tasks={[]} loading={false} onCreate={() => {}} onUpdate={() => {}} onDelete={() => {}} /> : <Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
