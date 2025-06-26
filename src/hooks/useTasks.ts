/* ------------------------------------------------------------------
   src/hooks/useTasks.ts
-------------------------------------------------------------------*/
import { useState, useEffect, useCallback } from 'react';
import { API, Auth } from 'aws-amplify';
import { Task } from '../types';

const apiName = 'manageTasks';   // 👈 matches name in aws-exports
const basePath = '/tasks';

export const useTasks = (userId: string | null) => {
  const [tasks,  setTasks] = useState<Task[]>([]);
  const [loading, setLoad] = useState(false);
  const [error,   setErr ] = useState<string | null>(null);

  /* helper to get JWT for auth header */
  const authHeader = async () => ({
    headers: {
      Authorization: (await Auth.currentSession()).getIdToken().getJwtToken(),
    },
  });

  /* ─── Fetch all tasks for user ─── */
  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    setLoad(true);
    try {
      const data = await API.get(
        apiName,
        basePath,
        {
          ...(await authHeader()),
          queryStringParameters: { userId },
        }
      );
      setTasks(data as Task[]);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoad(false);
    }
  }, [userId]);

  /* ─── Create task ─── */
  const createTask = async (task: Task) => {
    try {
      const newTask = await API.post(
        apiName,
        basePath,
        { ...(await authHeader()), body: task }
      );
      setTasks(prev => [...prev, newTask as Task]);
    } catch (e: any) {
      setErr(e.message);
    }
  };

  /* ─── Update task ─── */
  const updateTask = async (task: Task) => {
    try {
      const updated = await API.put(
        apiName,
        `${basePath}/${task.id}`,
        { ...(await authHeader()), body: task }
      );
      setTasks(prev =>
        prev.map(t => (t.id === task.id ? (updated as Task) : t))
      );
    } catch (e: any) {
      setErr(e.message);
    }
  };

  /* ─── Delete task ─── */
  const deleteTask = async (taskId: string) => {
    try {
      await API.del(
        apiName,
        `${basePath}/${taskId}`,
        await authHeader()
      );
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (e: any) {
      setErr(e.message);
    }
  };

  /* initial fetch when hook mounts / userId changes */
  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
  };
};
