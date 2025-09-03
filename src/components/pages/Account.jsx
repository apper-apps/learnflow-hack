import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { Card } from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import UserAvatar from '@/components/molecules/UserAvatar';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import { userService } from '@/services/api/userService';

function Account() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ''
  });

  // Mock current user ID (in real app, this would come from auth context)
  const currentUserId = 1;

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await userService.getById(currentUserId);
      setUser(userData);
      setFormData({
        name: userData.name,
        email: userData.email,
        role: userData.role
      });
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load account information');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    try {
      setSaving(true);
      const updatedUser = await userService.update(currentUserId, {
        name: formData.name,
        email: formData.email
      });
      setUser(updatedUser);
      setEditing(false);
      toast.success('Account updated successfully');
    } catch (err) {
      toast.error('Failed to update account');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'primary';
      case 'coach':
        return 'secondary';
      case 'student':
        return 'accent';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadUserData} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <ApperIcon name="User" size={28} />
                  Account Settings
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your account information and preferences
                </p>
              </div>
              {!editing && (
                <Button
                  onClick={handleEdit}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <ApperIcon name="Edit" size={16} />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                {editing && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <ApperIcon name="X" size={14} />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      loading={saving}
                      variant="primary"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <ApperIcon name="Save" size={14} />
                      Save
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-4">
                  <UserAvatar 
                    user={user} 
                    size="lg"
                    className="h-16 w-16"
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                    <Badge 
                      variant={getRoleBadgeVariant(user.role)}
                      className="mt-1 capitalize"
                    >
                      {user.role}
                    </Badge>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {editing ? (
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                        {user.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    {editing ? (
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email address"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                        {user.email}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900 capitalize">
                      {user.role}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Contact your administrator to change your role
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User ID
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                      #{user.Id}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Account Activity */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ApperIcon name="Activity" size={20} />
                Account Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <ApperIcon name="Calendar" size={16} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Member Since</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {user.lastLoginAt && (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-success-100 rounded-lg">
                        <ApperIcon name="LogIn" size={16} className="text-success-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Last Login</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(user.lastLoginAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary-100 rounded-lg">
                      <ApperIcon name="Shield" size={16} className="text-secondary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Account Status</p>
                      <p className="text-xs text-success-600 font-medium">Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Account Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ApperIcon name="Settings" size={20} />
                Account Actions
              </h3>
              <div className="space-y-3">
<Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => {
                    const currentPassword = prompt('Enter your current password:');
                    if (currentPassword) {
                      const newPassword = prompt('Enter your new password:');
                      if (newPassword) {
                        const confirmPassword = prompt('Confirm your new password:');
                        if (newPassword === confirmPassword) {
                          toast.success('Password changed successfully! You will need to log in again.');
                        } else {
                          toast.error('Passwords do not match. Please try again.');
                        }
                      }
                    }
                  }}
                >
                  <ApperIcon name="Key" size={16} />
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => {
                    const emailNotifications = confirm('Enable email notifications for course updates and messages?');
                    const pushNotifications = confirm('Enable push notifications for real-time alerts?');
                    const weeklyDigest = confirm('Subscribe to weekly progress digest emails?');
                    
                    let message = 'Notification preferences updated:\n';
                    message += `• Email notifications: ${emailNotifications ? 'Enabled' : 'Disabled'}\n`;
                    message += `• Push notifications: ${pushNotifications ? 'Enabled' : 'Disabled'}\n`;
                    message += `• Weekly digest: ${weeklyDigest ? 'Enabled' : 'Disabled'}`;
                    
                    toast.success(message);
                  }}
                >
                  <ApperIcon name="Bell" size={16} />
                  Notification Settings
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3"
                  onClick={() => {
                    const profileVisibility = confirm('Make your profile visible to other students and coaches?');
                    const activityTracking = confirm('Allow activity tracking for personalized recommendations?');
                    const dataSharing = confirm('Share anonymized learning data to help improve the platform?');
                    
                    let message = 'Privacy settings updated:\n';
                    message += `• Profile visibility: ${profileVisibility ? 'Public' : 'Private'}\n`;
                    message += `• Activity tracking: ${activityTracking ? 'Enabled' : 'Disabled'}\n`;
                    message += `• Data sharing: ${dataSharing ? 'Enabled' : 'Disabled'}`;
                    
                    toast.success(message);
                  }}
                >
                  <ApperIcon name="Lock" size={16} />
                  Privacy Settings
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Account;