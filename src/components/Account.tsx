import React, { useState, useMemo } from 'react';
import {
  User as UserIcon, Shield, Bell, Cloud, Activity, Database
} from 'lucide-react';
import { User as UserType } from '../types';

interface AccountProps {
  user: UserType;
}

export const Account: React.FC<AccountProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email
  });

  const [notifications, setNotifications] = useState({
    emailReminders: true,
    pushNotifications: false,
    weeklyDigest: true
  });

  const awsServices = [
    {
      name: 'AWS Cognito',
      description: 'User authentication and authorization',
      status: 'Active',
      icon: Shield,
      color: 'text-green-600 bg-green-100'
    },
    {
      name: 'AWS DynamoDB',
      description: 'NoSQL database for task storage',
      status: 'Active',
      icon: Database,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      name: 'AWS S3',
      description: 'File storage for attachments',
      status: 'Ready',
      icon: Cloud,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      name: 'AWS Lambda',
      description: 'Serverless functions for processing',
      status: 'Active',
      icon: Activity,
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  const formattedCreatedAt = useMemo(() => new Date(user.created_at).toLocaleDateString(), [user.created_at]);
  const formattedLastLogin = useMemo(() => user.last_login ? new Date(user.last_login).toLocaleString() : 'Never', [user.last_login]);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Update profile data:', profileData);

    // 🔧 TODO: Use AWS Cognito update call here:
    // await Auth.updateUserAttributes(...)
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'aws-services', name: 'AWS Services', icon: Cloud },
    { id: 'security', name: 'Security', icon: Shield }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h2>
        <p className="text-gray-600">Manage your profile and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

            {activeTab === 'profile' && (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h3>
                <div className="flex items-center space-x-6 mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <UserIcon className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{user.name}</h4>
                    <p className="text-gray-500">{user.email}</p>
                    <p className="text-sm text-gray-400">Member since {formattedCreatedAt}</p>
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update Profile
                  </button>
                </form>
              </>
            )}

            {activeTab === 'notifications' && (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h3>
                {[
                  { label: 'Email Reminders', key: 'emailReminders' },
                  { label: 'Push Notifications', key: 'pushNotifications' },
                  { label: 'Weekly Digest', key: 'weeklyDigest' }
                ].map(({ label, key }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{label}</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[key as keyof typeof notifications]}
                        onChange={() => toggleNotification(key as keyof typeof notifications)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-checked:bg-blue-600 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'aws-services' && (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">AWS Services Integration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {awsServices.map(service => {
                    const Icon = service.icon;
                    return (
                      <div key={service.name} className="border rounded-lg p-6 flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${service.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-600">{service.description}</p>
                          <span className="text-xs mt-1 inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full">
                            {service.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h3>
                <div className="space-y-6">
                  <div className="border p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-4">Account Activity</h4>
                    <p className="text-sm text-gray-600">Last login: <span className="text-gray-900 font-medium">{formattedLastLogin}</span></p>
                    <p className="text-sm text-gray-600">Account created: <span className="text-gray-900 font-medium">{formattedCreatedAt}</span></p>
                  </div>
                  <div className="border p-6 rounded-lg bg-red-50 border-red-200">
                    <h4 className="font-semibold text-red-900 mb-2">Danger Zone</h4>
                    <p className="text-sm text-red-700 mb-4">Deleting your account is permanent.</p>
                    <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700">Delete Account</button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
