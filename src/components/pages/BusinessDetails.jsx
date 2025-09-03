import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { Card } from '@/components/atoms/Card';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';

const BusinessDetails = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [businessData, setBusinessData] = useState({
    businessName: '',
    logo: '',
    website: '',
    description: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: ''
    }
  });
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockData = {
        businessName: 'LearnFlow Academy',
        logo: '',
        website: 'https://learnflow.academy',
        description: 'Empowering learners through innovative educational technology and personalized learning experiences.',
        socialLinks: {
          facebook: 'https://facebook.com/learnflowacademy',
          twitter: 'https://twitter.com/learnflow',
          linkedin: 'https://linkedin.com/company/learnflow',
          instagram: 'https://instagram.com/learnflowacademy'
        }
      };
      setBusinessData(mockData);
      setFormData(mockData);
    } catch (err) {
      setError('Failed to load business details');
      toast.error('Failed to load business details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setFormData({ ...businessData });
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({ ...businessData });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setBusinessData({ ...formData });
      setEditing(false);
      toast.success('Business details updated successfully!');
    } catch (err) {
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo file size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('logo', e.target.result);
        toast.success('Logo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

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
                  <ApperIcon name="Building" size={28} />
                  Business Details
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your business information and branding
                </p>
              </div>
              {!editing && (
                <Button
                  onClick={handleEdit}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <ApperIcon name="Edit" size={16} />
                  Edit Details
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Business Information */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
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
                    Save Changes
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Business Logo
                </label>
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    {formData.logo ? (
                      <img
                        src={formData.logo}
                        alt="Business Logo"
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <ApperIcon name="Building" size={32} className="text-gray-400" />
                    )}
                  </div>
                  {editing && (
                    <div>
                      <input
                        type="file"
                        id="logo-upload"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button
                        onClick={() => document.getElementById('logo-upload').click()}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <ApperIcon name="Upload" size={16} />
                        Upload Logo
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 2MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Business Name"
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    placeholder="Enter your business name"
                    disabled={!editing}
                  />
                </div>

                <div>
                  <Input
                    label="Website URL"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://your-website.com"
                    disabled={!editing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description
                </label>
                {editing ? (
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    placeholder="Describe your business..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {businessData.description || 'No description provided'}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Social Media Links */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ApperIcon name="Share2" size={20} />
              Social Media Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Facebook"
                type="url"
                value={formData.socialLinks?.facebook || ''}
                onChange={(e) => handleInputChange('socialLinks.facebook', e.target.value)}
                placeholder="https://facebook.com/yourpage"
                disabled={!editing}
              />
              <Input
                label="Twitter"
                type="url"
                value={formData.socialLinks?.twitter || ''}
                onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                placeholder="https://twitter.com/youraccount"
                disabled={!editing}
              />
              <Input
                label="LinkedIn"
                type="url"
                value={formData.socialLinks?.linkedin || ''}
                onChange={(e) => handleInputChange('socialLinks.linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/yourcompany"
                disabled={!editing}
              />
              <Input
                label="Instagram"
                type="url"
                value={formData.socialLinks?.instagram || ''}
                onChange={(e) => handleInputChange('socialLinks.instagram', e.target.value)}
                placeholder="https://instagram.com/youraccount"
                disabled={!editing}
              />
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ApperIcon name="Zap" size={20} />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => {
                  navigator.clipboard.writeText(businessData.website || '');
                  toast.success('Website URL copied to clipboard!');
                }}
              >
                <ApperIcon name="Copy" size={16} />
                Copy Website URL
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => {
                  const businessInfo = `Business: ${businessData.businessName}\nWebsite: ${businessData.website}\nDescription: ${businessData.description}`;
                  navigator.clipboard.writeText(businessInfo);
                  toast.success('Business information copied to clipboard!');
                }}
              >
                <ApperIcon name="Download" size={16} />
                Export Business Info
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetails;