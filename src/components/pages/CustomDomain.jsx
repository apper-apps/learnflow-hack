import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { Card } from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';

const CustomDomain = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [domainData, setDomainData] = useState({
    currentDomain: 'your-academy.learnflow.app',
    customDomain: '',
    isVerified: false,
    sslEnabled: false,
    dnsRecords: []
  });
  const [newDomain, setNewDomain] = useState('');

  useEffect(() => {
    loadDomainData();
  }, []);

  const loadDomainData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDomainData({
        currentDomain: 'academy.learnflow.app',
        customDomain: 'learn.mycompany.com',
        isVerified: true,
        sslEnabled: true,
        dnsRecords: [
          { type: 'CNAME', name: 'learn.mycompany.com', value: 'custom.learnflow.app', status: 'verified' },
          { type: 'TXT', name: '_verification.learn.mycompany.com', value: 'learnflow-verification=abc123', status: 'verified' }
        ]
      });
    } catch (err) {
      setError('Failed to load domain information');
      toast.error('Failed to load domain information');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain) {
      toast.error('Please enter a domain name');
      return;
    }

    if (!isValidDomain(newDomain)) {
      toast.error('Please enter a valid domain name');
      return;
    }

    try {
      setSaving(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDomainData(prev => ({
        ...prev,
        customDomain: newDomain,
        isVerified: false,
        dnsRecords: [
          { type: 'CNAME', name: newDomain, value: 'custom.learnflow.app', status: 'pending' },
          { type: 'TXT', name: `_verification.${newDomain}`, value: `learnflow-verification=${generateVerificationCode()}`, status: 'pending' }
        ]
      }));
      
      setNewDomain('');
      toast.success(`Domain ${newDomain} added! Please configure DNS records to verify.`);
    } catch (err) {
      toast.error('Failed to add domain. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyDomain = async () => {
    try {
      setSaving(true);
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate random success/failure for demo
      const isSuccess = Math.random() > 0.3;
      
      if (isSuccess) {
        setDomainData(prev => ({
          ...prev,
          isVerified: true,
          sslEnabled: true,
          dnsRecords: prev.dnsRecords.map(record => ({ ...record, status: 'verified' }))
        }));
        toast.success('Domain verified successfully! SSL certificate has been issued.');
      } else {
        toast.error('Domain verification failed. Please check your DNS configuration.');
      }
    } catch (err) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveDomain = () => {
    if (window.confirm('Are you sure you want to remove this custom domain? Your academy will revert to the default domain.')) {
      setDomainData(prev => ({
        ...prev,
        customDomain: '',
        isVerified: false,
        sslEnabled: false,
        dnsRecords: []
      }));
      toast.success('Custom domain removed successfully!');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const isValidDomain = (domain) => {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain);
  };

  const generateVerificationCode = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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
                  <ApperIcon name="Globe" size={28} />
                  Custom Domain
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Use your own domain for your learning academy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Current Domain */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Domain</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <ApperIcon name="Link" size={20} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {domainData.customDomain || domainData.currentDomain}
                  </p>
                  <p className="text-sm text-gray-500">
                    {domainData.customDomain ? 'Custom Domain' : 'Default Subdomain'}
                  </p>
                </div>
                {domainData.isVerified && (
                  <Badge variant="success" className="flex items-center gap-1">
                    <ApperIcon name="Check" size={12} />
                    Verified
                  </Badge>
                )}
                {domainData.sslEnabled && (
                  <Badge variant="success" className="flex items-center gap-1">
                    <ApperIcon name="Shield" size={12} />
                    SSL
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => window.open(`https://${domainData.customDomain || domainData.currentDomain}`, '_blank')}
                className="flex items-center gap-2"
              >
                <ApperIcon name="ExternalLink" size={16} />
                Visit
              </Button>
            </div>
          </Card>

          {/* Add Custom Domain */}
          {!domainData.customDomain && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Custom Domain</h2>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="yourdomain.com"
                    className="w-full"
                  />
                </div>
                <Button
                  onClick={handleAddDomain}
                  loading={saving}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <ApperIcon name="Plus" size={16} />
                  Add Domain
                </Button>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex gap-3">
                  <ApperIcon name="Info" size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Before adding your domain:</p>
                    <ul className="space-y-1 text-sm">
                      <li>• Make sure you own the domain and can modify DNS settings</li>
                      <li>• Have access to your domain's DNS management panel</li>
                      <li>• The domain should not be in use by another service</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* DNS Configuration */}
          {domainData.customDomain && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">DNS Configuration</h2>
                <div className="flex gap-2">
                  {!domainData.isVerified && (
                    <Button
                      onClick={handleVerifyDomain}
                      loading={saving}
                      variant="primary"
                      className="flex items-center gap-2"
                    >
                      <ApperIcon name="RefreshCw" size={16} />
                      Verify Domain
                    </Button>
                  )}
                  <Button
                    onClick={handleRemoveDomain}
                    variant="outline"
                    className="text-error-600 hover:text-error-700"
                  >
                    Remove Domain
                  </Button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Add these DNS records to your domain's DNS settings:
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Value</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domainData.dnsRecords.map((record, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">{record.type}</td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">{record.name}</td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-600 max-w-xs truncate">
                          {record.value}
                        </td>
                        <td className="px-4 py-3">
                          <Badge 
                            variant={record.status === 'verified' ? 'success' : 'warning'}
                            className="flex items-center gap-1"
                          >
                            <ApperIcon 
                              name={record.status === 'verified' ? 'Check' : 'Clock'} 
                              size={12} 
                            />
                            {record.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            onClick={() => copyToClipboard(record.value)}
                            variant="ghost"
                            size="sm"
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <ApperIcon name="Copy" size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!domainData.isVerified && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="flex gap-3">
                    <ApperIcon name="AlertTriangle" size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-700">
                      <p className="font-medium mb-1">Domain not yet verified</p>
                      <p>
                        Add the DNS records above to your domain's DNS settings, then click "Verify Domain". 
                        It may take up to 24 hours for DNS changes to propagate.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* SSL Certificate */}
          {domainData.customDomain && domainData.isVerified && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-success-100 rounded-lg">
                  <ApperIcon name="Shield" size={20} className="text-success-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">SSL Certificate</h2>
                  <p className="text-sm text-gray-500">Secure your domain with HTTPS</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ApperIcon name="Check" size={20} className="text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">SSL Certificate Active</p>
                    <p className="text-sm text-green-700">Your domain is secured with HTTPS</p>
                  </div>
                </div>
                <Badge variant="success">Secure</Badge>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ApperIcon name="Calendar" size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Issued</span>
                  </div>
                  <p className="text-sm text-gray-900">January 15, 2024</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ApperIcon name="Clock" size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Expires</span>
                  </div>
                  <p className="text-sm text-gray-900">April 15, 2024</p>
                </div>
              </div>
            </Card>
          )}

          {/* Domain Tips */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ApperIcon name="Lightbulb" size={20} />
              Domain Tips
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <ApperIcon name="CheckCircle" size={16} className="text-success-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Choose a memorable domain</p>
                  <p className="text-sm text-gray-600">Keep it short, easy to spell, and related to your brand</p>
                </div>
              </div>
              <div className="flex gap-3">
                <ApperIcon name="CheckCircle" size={16} className="text-success-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Use a subdomain for organization</p>
                  <p className="text-sm text-gray-600">Consider using learn.yourcompany.com or academy.yourcompany.com</p>
                </div>
              </div>
              <div className="flex gap-3">
                <ApperIcon name="CheckCircle" size={16} className="text-success-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">DNS propagation takes time</p>
                  <p className="text-sm text-gray-600">Changes may take up to 24 hours to take effect globally</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomDomain;