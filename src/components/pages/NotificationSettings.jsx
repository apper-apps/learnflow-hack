import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';

const NotificationSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    email: {
      courseUpdates: true,
      studentProgress: true,
      newMessages: true,
      systemAnnouncements: false,
      weeklyDigest: true,
      marketingEmails: false
    },
    push: {
      newMessages: true,
      studentSubmissions: true,
      deadlines: true,
      mentions: true,
      systemAlerts: true
    },
    inApp: {
      allNotifications: true,
      sound: false,
      desktop: true
    }
  });

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      // Settings already initialized above
    } catch (err) {
      setError('Failed to load notification settings');
      toast.error('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (category, setting) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notification settings updated successfully!');
    } catch (err) {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = (type) => {
    switch (type) {
      case 'email':
        toast.success('Test email sent! Check your inbox.');
        break;
      case 'push':
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('LearnFlow Test', {
            body: 'This is a test push notification!',
            icon: '/favicon.ico'
          });
          toast.success('Test push notification sent!');
        } else {
          toast.info('Push notifications not available or permission not granted.');
        }
        break;
      default:
        toast.success('Test notification sent!');
    }
  };

  const requestPushPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Push notifications enabled!');
      } else {
        toast.error('Push notification permission denied.');
      }
    } else {
      toast.error('Push notifications not supported by your browser.');
    }
  };

  const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${checked ? 'bg-primary-600' : 'bg-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <ApperIcon name="Bell" size={28} />
                  Notification Settings
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage how you receive notifications and updates
                </p>
              </div>
              <Button
                onClick={handleSaveSettings}
                loading={saving}
                variant="primary"
                className="flex items-center gap-2"
              >
                <ApperIcon name="Save" size={16} />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Email Notifications */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <ApperIcon name="Mail" size={20} className="text-primary-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Email Notifications</h2>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestNotification('email')}
                className="flex items-center gap-2"
              >
                <ApperIcon name="Send" size={14} />
                Test Email
              </Button>
            </div>

            <div className="space-y-4">
              {[
                { key: 'courseUpdates', label: 'Course Updates', description: 'New lessons, announcements, and course changes' },
                { key: 'studentProgress', label: 'Student Progress', description: 'When students complete lessons or assignments' },
                { key: 'newMessages', label: 'New Messages', description: 'Direct messages and chat notifications' },
                { key: 'systemAnnouncements', label: 'System Announcements', description: 'Platform updates and maintenance notifications' },
                { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Summary of weekly activity and progress' },
                { key: 'marketingEmails', label: 'Marketing Emails', description: 'Product updates and promotional content' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <ToggleSwitch
                    checked={settings.email[item.key]}
                    onChange={() => handleToggle('email', item.key)}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Push Notifications */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success-100 rounded-lg">
                  <ApperIcon name="Smartphone" size={20} className="text-success-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Push Notifications</h2>
                  <p className="text-sm text-gray-500">Real-time browser notifications</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestPushPermission}
                  className="flex items-center gap-2"
                >
                  <ApperIcon name="Shield" size={14} />
                  Enable
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestNotification('push')}
                  className="flex items-center gap-2"
                >
                  <ApperIcon name="Send" size={14} />
                  Test
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { key: 'newMessages', label: 'New Messages', description: 'Instant chat and message notifications' },
                { key: 'studentSubmissions', label: 'Student Submissions', description: 'When students submit assignments' },
                { key: 'deadlines', label: 'Deadline Reminders', description: 'Upcoming assignment and course deadlines' },
                { key: 'mentions', label: 'Mentions', description: 'When you are mentioned in comments or discussions' },
                { key: 'systemAlerts', label: 'System Alerts', description: 'Critical system notifications and alerts' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <ToggleSwitch
                    checked={settings.push[item.key]}
                    onChange={() => handleToggle('push', item.key)}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* In-App Notifications */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-secondary-100 rounded-lg">
                <ApperIcon name="Monitor" size={20} className="text-secondary-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">In-App Notifications</h2>
                <p className="text-sm text-gray-500">Notifications within the application</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { key: 'allNotifications', label: 'Show All Notifications', description: 'Display notification center and badges' },
                { key: 'sound', label: 'Sound Effects', description: 'Play sound for new notifications' },
                { key: 'desktop', label: 'Desktop Banners', description: 'Show notification banners on desktop' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <ToggleSwitch
                    checked={settings.inApp[item.key]}
                    onChange={() => handleToggle('inApp', item.key)}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Notification Schedule */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-warning-100 rounded-lg">
                <ApperIcon name="Clock" size={20} className="text-warning-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Quiet Hours</h2>
                <p className="text-sm text-gray-500">Set times when you don't want to receive notifications</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  defaultValue="22:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  defaultValue="08:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                <span className="text-sm text-gray-700">Apply quiet hours on weekends</span>
              </label>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;