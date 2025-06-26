import { useState, useEffect, useCallback } from 'react';
import { API, Auth } from 'aws-amplify';
import { Task } from '../types';

const apiName = 'tasksApi';
const path    = '/tasks';

export const useTasks = (userId: string | null) => {
  const [tasks,  setTasks] = useState<Task[]>([]);
  const [loading, setLoad] = useState(false);
  const [error,   setErr ] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    setLoad(true);
    try {
      const jwt = (await Auth.currentSession()).getIdToken().getJwtToken();
      const data = await API.get(apiName, path, {
        headers: { Authorization: jwt },
        queryStringParameters: { userId },
      });
      setTasks(data as Task[]);
    } catch (e: any) {
      setErr(e.message);
    } finally { setLoad(false); }
  }, [userId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  return { tasks, loading, error };
};
