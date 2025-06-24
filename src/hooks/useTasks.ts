import { useState, useEffect } from 'react';
import { Task, TaskFilters } from '../types';

// Simulating AWS DynamoDB integration
export const useTasks = (userId: string | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadTasks();
    }
  }, [userId]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      // Simulate DynamoDB query
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const savedTasks = localStorage.getItem(`userTasks_${userId}`);
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        // Initialize with sample tasks
        const sampleTasks: Task[] = [
          {
            id: '1',
            user_id: userId!,
            title: 'Complete Mathematics Assignment',
            description: 'Solve problems 1-20 from Chapter 5',
            subject: 'Mathematics',
            priority: 'high',
            status: 'pending',
            due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            user_id: userId!,
            title: 'Research Paper Draft',
            description: 'Write the first draft for History research paper',
            subject: 'History',
            priority: 'medium',
            status: 'in_progress',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setTasks(sampleTasks);
        localStorage.setItem(`userTasks_${userId}`, JSON.stringify(sampleTasks));
      }
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!userId) return null;
    
    const newTask: Task = {
      ...taskData,
      id: Math.random().toString(36).substr(2, 9),
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    localStorage.setItem(`userTasks_${userId}`, JSON.stringify(updatedTasks));
    return newTask;
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId
        ? { ...task, ...updates, updated_at: new Date().toISOString() }
        : task
    );
    setTasks(updatedTasks);
    if (userId) {
      localStorage.setItem(`userTasks_${userId}`, JSON.stringify(updatedTasks));
    }
  };

  const deleteTask = async (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    if (userId) {
      localStorage.setItem(`userTasks_${userId}`, JSON.stringify(updatedTasks));
    }
  };

  const filterTasks = (filters: TaskFilters) => {
    return tasks.filter(task => {
      const matchesSubject = !filters.subject || task.subject === filters.subject;
      const matchesPriority = !filters.priority || task.priority === filters.priority;
      const matchesStatus = !filters.status || task.status === filters.status;
      const matchesSearch = !filters.search || 
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesSubject && matchesPriority && matchesStatus && matchesSearch;
    });
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    filterTasks,
    refreshTasks: loadTasks
  };
};