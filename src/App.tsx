import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { Auth } from './components/Auth';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TaskList } from './components/TaskList';
import { Account } from './components/Account';
import { Task } from './types';

/* ─────────────────────────────────────────────── */
/*  MAIN APP                                       */
/* ─────────────────────────────────────────────── */
function App() {
  /* 1️⃣ auth state */
  const {
    user,
    loading: authLoading,
    error:   authError,
    signIn,
    signUp,
    signOut,
    needsConfirm,
    confirmSignUp,
    resendCode,
  } = useAuth();

  /* 2️⃣ tasks state */
  const {
    tasks,
    loading: tasksLoading,
    error:   tasksError,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks(user?.id ?? null);

  /* 3️⃣ local UI routing */
  const [currentView, setCurrentView] =
    useState<'dashboard' | 'tasks' | 'account'>('dashboard');

  /* 4️⃣ global splash while checking session */
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  /* 5️⃣ show Auth/OTP screen until user is confirmed & signed-in */
  if (!user) {
    return (
      <Auth
        onSignIn={signIn}
        onSignUp={signUp}
        confirmSignUp={confirmSignUp}
        resendCode={resendCode}
        needsConfirm={needsConfirm}
        loading={authLoading}
        error={authError}
      />
    );
  }

  /* 6️⃣ render chosen view */
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard tasks={tasks} />;
      case 'tasks':
        return (
          <TaskList
            tasks={tasks}
            loading={tasksLoading}
            error={tasksError}
            onCreate={createTask}
            onUpdate={updateTask}
            onDelete={deleteTask}
          />
        );
      case 'account':
        return <Account user={user} />;
      default:
        return <Dashboard tasks={tasks} />;
    }
  };

  /* 7️⃣ authenticated layout */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header
        user={user}
        currentView={currentView}
        onChangeView={setCurrentView}
        onSignOut={signOut}
      />
      <main className="px-4 sm:px-6 lg:px-8 py-6">{renderView()}</main>
    </div>
  );
}

export default App;     /* 👈 **MUST** be present – fixes previous build error */
