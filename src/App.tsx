import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { Auth } from './components/Auth';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TaskList } from './components/TaskList';
import { Account } from './components/Account';

function App() {
  const { user, loading: authLoading, error: authError, signIn, signUp, signOut } = useAuth();
  const { tasks, loading: tasksLoading, createTask, updateTask, deleteTask } = useTasks(user?.id || null);
  const [currentView, setCurrentView] = useState('dashboard');

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Auth 
        onSignIn={signIn}
        onSignUp={signUp}
        loading={authLoading}
        error={authError}
      />
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard tasks={tasks} />;
      case 'tasks':
        return (
          <TaskList
            tasks={tasks}
            loading={tasksLoading}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header
        user={user}
        currentView={currentView}
        onViewChange={setCurrentView}
        onSignOut={signOut}
      />
      <main>
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;