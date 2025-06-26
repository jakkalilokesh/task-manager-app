import { useState, useEffect } from 'react';
import { API, Auth } from 'aws-amplify';
import { Task } from '../types';

const apiName = 'tasksApi';
const path = '/tasks';

export const useTasks = (userId: string | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const token = (await Auth.currentSession()).getAccessToken().getJwtToken();
      const response = await API.get(apiName, path, {
        headers: {
          Authorization: token,
        },
        queryStringParameters: {
          userId,
        },
      });
      setTasks(response);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  return { tasks, loading, error };
};
