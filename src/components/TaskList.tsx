import React, { useState } from 'react';
import {
  Plus, Edit3, Trash2, Calendar,
} from 'lucide-react';
import { Task, TaskFilters } from '../types';
import { TaskForm } from './TaskForm';

interface Props {
  tasks: Task[];
  loading: boolean;
  error?: string | null;
  onCreate: (task: Task) => void;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskList: React.FC<Props> = ({
  tasks, loading, error, onCreate, onUpdate, onDelete,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({
    subject: '', priority: '', status: '', search: '',
  });

  const subjects = Array.from(new Set(tasks.map(t => t.subject)));

  const filtered = tasks.filter(t => {
    const f = filters;
    const match = (val: string, filter: string) => !filter || val === filter;
    return (
      match(t.subject, f.subject) &&
      match(t.priority, f.priority) &&
      match(t.status, f.status) &&
      (!f.search ||
        t.title.toLowerCase().includes(f.search.toLowerCase()) ||
        (t.description?.toLowerCase().includes(f.search.toLowerCase()) ?? false))
    );
  });

  const save = (td: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (editing) onUpdate({ ...editing, ...td });
    else onCreate(td as Task);
    setShowForm(false); setEditing(null);
  };

  if (showForm) {
    return (
      <TaskForm
        task={editing}
        onSubmit={async (td) => save(td)}
        onCancel={() => { setShowForm(false); setEditing(null); }}
        subjects={subjects}
      />
    );
  }

  if (loading) return <p className="text-center text-gray-500">Loading…</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  if (filtered.length === 0) {
    return (
      <div className="text-center py-20">
        <img
          src="https://undraw.co/api/illustrations/empty_tasks.svg?color=6C63FF"
          alt="No tasks"
          className="w-60 mx-auto mb-6 opacity-80"
        />
        <p className="text-2xl font-semibold mb-4">No tasks yet</p>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded"
        >
          <Plus className="w-4 h-4 mr-2" /> New Task
        </button>
      </div>
    );
  }

  const tag = (txt: string, cls: string) => (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{txt}</span>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">My Tasks</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <input
          placeholder="Search…"
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <select
          value={filters.subject}
          onChange={e => setFilters({ ...filters, subject: e.target.value })}
          className="border px-3 py-2 rounded"
        >
          <option value="">Filter by subject</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filters.priority}
          onChange={e => setFilters({ ...filters, priority: e.target.value })}
          className="border px-3 py-2 rounded"
        >
          <option value="">Filter by priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={filters.status}
          onChange={e => setFilters({ ...filters, status: e.target.value })}
          className="border px-3 py-2 rounded"
        >
          <option value="">Filter by status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Task Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {filtered.map(t => (
          <div key={t.id} className="bg-white border rounded-lg p-4 shadow">
            <div className="flex justify-between mb-2">
              <h3 className="font-semibold">{t.title}</h3>
              <div className="flex space-x-2">
                <button onClick={() => { setEditing(t); setShowForm(true); }}>
                  <Edit3 className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                </button>
                <button onClick={() => onDelete(t.id)}>
                  <Trash2 className="w-5 h-5 text-red-600 hover:text-red-800" />
                </button>
              </div>
            </div>
            {t.description && <p className="text-gray-600 mb-2">{t.description}</p>}
            <div className="flex flex-wrap gap-2 text-sm mb-2">
              {tag(t.subject, 'bg-gray-100 text-gray-700')}
              {tag(t.priority, 'bg-yellow-100 text-yellow-700')}
              {tag(t.status.replace('_', ' '), 'bg-blue-100 text-blue-700')}
              <span className="flex items-center bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(t.due_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
