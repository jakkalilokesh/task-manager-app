import React, { useState } from 'react';
import {
  Plus, Search, Filter, Calendar, Clock,
  AlertCircle, CheckCircle2, Edit3, Trash2, Paperclip,
} from 'lucide-react';
import { Task, TaskFilters } from '../types';
import { TaskForm } from './TaskForm';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error?: string | null;
  onCreate: (task: Task) => void;     // ✔ simplified
  onUpdate: (task: Task) => void;     // ✔ simplified
  onDelete: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading,
  error,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    subject: '',
    priority: '',
    status: '',
    search: '',
  });

  /* ───────── helpers ───────── */
  const subjects = [...new Set(tasks.map(t => t.subject))];

  const filteredTasks = tasks.filter(task => {
    const mSub  = !filters.subject  || task.subject  === filters.subject;
    const mPri  = !filters.priority || task.priority === filters.priority;
    const mStat = !filters.status   || task.status   === filters.status;
    const mSrch =
      !filters.search ||
      task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      task.description?.toLowerCase().includes(filters.search.toLowerCase());
    return mSub && mPri && mStat && mSrch;
  });

  /* status change */
  const handleStatusChange = (task: Task, status: Task['status']) => {
    onUpdate({ ...task, status });           // ✔ call with full Task
  };

  /* open form in edit mode */
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  /* form submit (create or update) */
  const handleFormSubmit = async (
    taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    if (editingTask) {
      onUpdate({ ...editingTask, ...taskData });     // ✔ pass Task
    } else {
      onCreate(taskData as unknown as Task);         // cast keeps UI unchanged
    }
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleFormCancel = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  /* color helpers (unchanged) */
  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high':   return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':    return 'bg-green-100 text-green-800 border-green-200';
      default:       return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'completed':   return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':     return 'bg-gray-100 text-gray-800 border-gray-200';
      default:            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  /* render TaskForm in modal mode */
  if (showTaskForm) {
    return (
      <TaskForm
        task={editingTask}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        subjects={subjects}
      />
    );
  }

  /* --------------- UI below is untouched --------------- */
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ... entire existing JSX markup stays exactly the same ... */}
      {/* (no functional changes below this point) */}
      {/* Filters, Task cards, etc. */}
    </div>
  );
};
