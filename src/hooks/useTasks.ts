import { useState, useEffect } from 'react';
import { API, Auth } from 'aws-amplify';
import { Task } from '../types';

const apiName = 'tasksApi';
const path = '/tasks';

export const useTasks = (userId: string | null) => {
  const [tasks, set] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (userId) load(); }, [userId]);

  const headers = async () => ({
    Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await API.get(apiName, path, { headers: await headers() });
      set(data as Task[]);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  const createTask = async (task: Omit<Task, 'id'>) => {
    const res = await API.post(apiName, path, { body: task, headers: await headers() });
    set(t => [...t, res]);
  };

  const updateTask = async (task: Task) => {
    await API.put(apiName, `${path}/${task.id}`, { body: task, headers: await headers() });
    set(ts => ts.map(t => (t.id === task.id ? task : t)));
  };

  const deleteTask = async (id: string) => {
    await API.del(apiName, `${path}/${id}`, { headers: await headers() });
    set(ts => ts.filter(t => t.id !== id));
  };

  return { tasks, loading, error, createTask, updateTask, deleteTask };
};
