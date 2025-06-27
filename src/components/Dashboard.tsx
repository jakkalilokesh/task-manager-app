// src/components/Dashboard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { Task } from '../types';

interface DashboardProps {
  tasks: Task[];
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
  /* ---------- derived stats ---------- */
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    overdue: tasks.filter(
      (t) => new Date(t.due_date) < new Date() && t.status !== 'completed'
    ).length,
  };

  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const priorityStats = {
    high: tasks.filter((t) => t.priority === 'high' && t.status !== 'completed')
      .length,
    medium: tasks.filter(
      (t) => t.priority === 'medium' && t.status !== 'completed'
    ).length,
    low: tasks.filter((t) => t.priority === 'low' && t.status !== 'completed')
      .length,
  };

  const subjectStats = tasks.reduce((acc, task) => {
    acc[task.subject] = (acc[task.subject] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const upcomingTasks = tasks
    .filter((t) => t.status !== 'completed')
    .sort(
      (a, b) =>
        new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    )
    .slice(0, 5);

  /* ---------- UI ---------- */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">
          Overview of your academic progress and upcoming tasks
        </p>
      </div>

      {/* ---------- Stats Grid ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* total */}
        <StatCard
          label="Total Tasks"
          value={stats.total}
          Icon={BookOpen}
          iconColor="text-blue-600"
          bgColor="bg-blue-100"
        />
        {/* completed */}
        <StatCard
          label="Completed"
          value={stats.completed}
          Icon={CheckCircle}
          iconColor="text-green-600"
          bgColor="bg-green-100"
          valueColor="text-green-600"
        />
        {/* in progress */}
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          Icon={Clock}
          iconColor="text-blue-600"
          bgColor="bg-blue-100"
        />
        {/* overdue */}
        <StatCard
          label="Overdue"
          value={stats.overdue}
          Icon={AlertTriangle}
          iconColor="text-red-600"
          bgColor="bg-red-100"
          valueColor="text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ---------- Progress Overview ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          viewport={{ once: true }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Progress Overview
            </h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Completion Rate
              </span>
              <span className="text-sm font-bold text-gray-900">
                {completionRate}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <PriorityStat color="red" value={priorityStats.high} label="High" />
            <PriorityStat
              color="yellow"
              value={priorityStats.medium}
              label="Medium"
            />
            <PriorityStat
              color="green"
              value={priorityStats.low}
              label="Low"
            />
          </div>
        </motion.div>

        {/* ---------- Upcoming Tasks ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Upcoming Tasks
            </h3>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>

          <div className="space-y-4">
            {upcomingTasks.length ? (
              upcomingTasks.map((task) => {
                const daysUntilDue = Math.ceil(
                  (new Date(task.due_date).getTime() -
                    new Date().getTime()) /
                    86_400_000
                );
                const isOverdue = daysUntilDue < 0;
                const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

                return (
                  <div
                    key={task.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`w-3 h-3 rounded-full mt-2 ${
                        task.priority === 'high'
                          ? 'bg-red-500'
                          : task.priority === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500">{task.subject}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOverdue
                            ? 'text-red-600 font-medium'
                            : isDueSoon
                            ? 'text-yellow-600 font-medium'
                            : 'text-gray-500'
                        }`}
                      >
                        {isOverdue
                          ? `${Math.abs(daysUntilDue)} days overdue`
                          : daysUntilDue === 0
                          ? 'Due today'
                          : daysUntilDue === 1
                          ? 'Due tomorrow'
                          : `Due in ${daysUntilDue} days`}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-8">
                No upcoming tasks
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* ---------- Subject Distribution ---------- */}
      {Object.keys(subjectStats).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          viewport={{ once: true }}
          className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Tasks by Subject
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(subjectStats).map(([subj, count]) => (
              <div
                key={subj}
                className="text-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
              >
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-600">{subj}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

/* ------------- tiny helper components ------------- */
const StatCard = ({
  label,
  value,
  Icon,
  iconColor,
  bgColor,
  valueColor = 'text-gray-900',
}: {
  label: string;
  value: number;
  Icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  valueColor?: string;
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
      </div>
      <div
        className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}
      >
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
    </div>
  </div>
);

const PriorityStat = ({
  color,
  value,
  label,
}: {
  color: 'red' | 'yellow' | 'green';
  value: number;
  label: string;
}) => {
  const colorMap: Record<string, string> = {
    red: 'text-red-600 bg-red-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    green: 'text-green-600 bg-green-50',
  };
  return (
    <div className={`text-center p-4 rounded-xl ${colorMap[color]}`}>
      <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
      <p className="text-sm">{label} Priority</p>
    </div>
  );
};

export default Dashboard;
