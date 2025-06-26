import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { Auth } from './components/Auth';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TaskList } from './components/TaskList';
import { Account } from './components/Account';

function App() {
  /* ──────────────────────────────────────────────
     1. AUTH HOOK
  ─────────────────────────────────────────────── */
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

  /* ──────────────────────────────────────────────
     2. TASKS HOOK
  ─────────────────────────────────────────────── */
  const {
    tasks,
    loading: tasksLoading,
    error:   tasksError,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks(user?.id ?? null);

  /* ──────────────────────────────────────────────
     3. LOCAL UI STATE
  ─────────────────────────────────────────────── */
  const [currentView, setCurrentView] = useState<'dashboard' | 'tasks' | 'account'>('dashboard');

  /* ──────────────────────────────────────────────
     4. GLOBAL LOADING SPINNER
  ─────────────────────────────────────────────── */
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

  /* ──────────────────────────────────────────────
     5. IF NOT AUTHENTICATED → SHOW <Auth>
  ─────────────────────────────────────────────── */
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

  /* ──────────────────────────────────────────────
     6. RENDER MAIN VIEWS
  ─────────────────────────────────────────────── */
  const renderCurrentView = () => {
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

  /* ──────────────────────────────────────────────
     7. AUTHENTICATED LAYOUT
  ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header
        user={user}
        currentView={currentView}
        onChangeView={setCurrentView}
        onSignOut={signOut}
      />

      <main className="px-4 sm:px-6 lg:px-8 py-6">{renderCurrentView()}</main>
    </div>
  );
}

/* ──────────────────────────────────────────────
   8. DEFAULT EXPORT  ← required by main.tsx
─────────────────────────────────────────────── */
export default App;
