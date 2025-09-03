import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';

const Integrations = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [connectedIntegrations, setConnectedIntegrations] = useState(new Set(['stripe', 'zoom']));

  const integrationCategories = [
    { id: 'all', name: 'All', icon: 'Grid3X3' },
    { id: 'crm', name: 'CRM', icon: 'Users' },
    { id: 'payments', name: 'Payments', icon: 'CreditCard' },
    { id: 'automation', name: 'Automation', icon: 'Zap' },
    { id: 'communication', name: 'Communication', icon: 'MessageSquare' },
    { id: 'accounting', name: 'Accounting', icon: 'Calculator' },
    { id: 'development', name: 'Development', icon: 'Code' },
    { id: 'analytics', name: 'Analytics', icon: 'BarChart3' }
  ];

  const integrations = [
    // CRM
    {
      id: 'hubspot',
      name: 'HubSpot',
      category: 'crm',
      description: 'Sync student data and track engagement with HubSpot CRM',
      icon: 'Building2',
      color: 'from-orange-500 to-orange-600',
      features: ['Contact sync', 'Deal tracking', 'Email automation']
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      category: 'crm',
      description: 'Connect with Salesforce for advanced student relationship management',
      icon: 'Cloud',
      color: 'from-blue-500 to-blue-600',
      features: ['Lead management', 'Opportunity tracking', 'Custom fields']
    },
    {
      id: 'pipedrive',
      name: 'Pipedrive',
      category: 'crm',
      description: 'Streamline your sales pipeline with Pipedrive integration',
      icon: 'TrendingUp',
      color: 'from-green-500 to-green-600',
      features: ['Pipeline management', 'Activity tracking', 'Reporting']
    },

    // Payments
    {
      id: 'stripe',
      name: 'Stripe',
      category: 'payments',
      description: 'Accept payments and manage subscriptions with Stripe',
      icon: 'CreditCard',
      color: 'from-purple-500 to-purple-600',
      features: ['Payment processing', 'Subscription billing', 'Invoicing']
    },
    {
      id: 'paypal',
      name: 'PayPal',
      category: 'payments',
      description: 'Enable PayPal payments for course purchases',
      icon: 'DollarSign',
      color: 'from-blue-600 to-blue-700',
      features: ['One-time payments', 'Recurring billing', 'Checkout']
    },
    {
      id: 'square',
      name: 'Square',
      category: 'payments',
      description: 'Process payments with Square\'s secure platform',
      icon: 'Square',
      color: 'from-gray-600 to-gray-700',
      features: ['Card processing', 'Point of sale', 'Analytics']
    },

    // Automation
    {
      id: 'zapier',
      name: 'Zapier',
      category: 'automation',
      description: 'Automate workflows between LearnFlow and 5000+ apps',
      icon: 'Zap',
      color: 'from-orange-400 to-orange-500',
      features: ['Workflow automation', '5000+ app connections', 'Triggers & actions']
    },
    {
      id: 'theleap',
      name: 'The Leap',
      category: 'automation',
      description: 'Connect with The Leap for advanced course automation',
      icon: 'Rocket',
      color: 'from-indigo-500 to-indigo-600',
      features: ['Course automation', 'Student onboarding', 'Progress tracking']
    },
    {
      id: 'make',
      name: 'Make',
      category: 'automation',
      description: 'Visual automation platform for complex workflows',
      icon: 'Workflow',
      color: 'from-purple-400 to-purple-500',
      features: ['Visual automation', 'API connections', 'Data mapping']
    },

    // Communication
    {
      id: 'zoom',
      name: 'Zoom',
      category: 'communication',
      description: 'Schedule and host video calls directly from LearnFlow',
      icon: 'Video',
      color: 'from-blue-400 to-blue-500',
      features: ['Video conferencing', 'Meeting scheduling', 'Recording']
    },
    {
      id: 'slack',
      name: 'Slack',
      category: 'communication',
      description: 'Get notifications and manage courses from Slack',
      icon: 'MessageSquare',
      color: 'from-purple-600 to-purple-700',
      features: ['Notifications', 'Commands', 'Channel integration']
    },
    {
      id: 'discord',
      name: 'Discord',
      category: 'communication',
      description: 'Build learning communities with Discord integration',
      icon: 'Users',
      color: 'from-indigo-600 to-indigo-700',
      features: ['Community building', 'Voice channels', 'Role management']
    },
    {
      id: 'calendly',
      name: 'Calendly',
      category: 'communication',
      description: 'Schedule coaching sessions with Calendly',
      icon: 'Calendar',
      color: 'from-blue-500 to-blue-600',
      features: ['Meeting scheduling', 'Availability management', 'Reminders']
    },

    // Accounting
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      category: 'accounting',
      description: 'Sync revenue and expenses with QuickBooks',
      icon: 'Calculator',
      color: 'from-green-600 to-green-700',
      features: ['Revenue tracking', 'Expense management', 'Tax reporting']
    },
    {
      id: 'xero',
      name: 'Xero',
      category: 'accounting',
      description: 'Connect your accounting with Xero',
      icon: 'PieChart',
      color: 'from-blue-500 to-blue-600',
      features: ['Invoice sync', 'Financial reporting', 'Bank reconciliation']
    },
    {
      id: 'freshbooks',
      name: 'FreshBooks',
      category: 'accounting',
      description: 'Manage invoicing and expenses with FreshBooks',
      icon: 'FileText',
      color: 'from-green-500 to-green-600',
      features: ['Invoicing', 'Time tracking', 'Expense tracking']
    },

    // Development
    {
      id: 'github',
      name: 'GitHub',
      category: 'development',
      description: 'Connect coding courses with GitHub repositories',
      icon: 'Github',
      color: 'from-gray-800 to-gray-900',
      features: ['Repository access', 'Assignment submission', 'Code review']
    },
    {
      id: 'notion',
      name: 'Notion',
      category: 'development',
      description: 'Sync course content and notes with Notion',
      icon: 'FileText',
      color: 'from-gray-600 to-gray-700',
      features: ['Content sync', 'Note taking', 'Knowledge base']
    },

    // Analytics
    {
      id: 'googleanalytics',
      name: 'Google Analytics',
      category: 'analytics',
      description: 'Track student engagement and course performance',
      icon: 'BarChart3',
      color: 'from-orange-500 to-orange-600',
      features: ['User tracking', 'Conversion analysis', 'Custom events']
    },
    {
      id: 'mixpanel',
      name: 'Mixpanel',
      category: 'analytics',
      description: 'Advanced analytics for student behavior tracking',
      icon: 'TrendingUp',
      color: 'from-purple-500 to-purple-600',
      features: ['Event tracking', 'Funnel analysis', 'Cohort analysis']
    }
  ];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleConnect = (integrationId, integrationName) => {
    if (connectedIntegrations.has(integrationId)) {
      setConnectedIntegrations(prev => {
        const newSet = new Set(prev);
        newSet.delete(integrationId);
        return newSet;
      });
      toast.success(`${integrationName} disconnected successfully`);
    } else {
      setConnectedIntegrations(prev => new Set([...prev, integrationId]));
      toast.success(`${integrationName} connected successfully`);
    }
  };

  const handleConfigure = (integrationName) => {
    toast.info(`Opening ${integrationName} configuration...`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-4">
              <ApperIcon name="Zap" className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
              <p className="text-gray-600 mt-1">Connect LearnFlow with your favorite tools and services</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <ApperIcon name="CheckCircle" className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{connectedIntegrations.size}</p>
                    <p className="text-sm text-gray-600">Connected</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <ApperIcon name="Grid3X3" className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{integrations.length}</p>
                    <p className="text-sm text-gray-600">Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <ApperIcon name="Zap" className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{integrationCategories.length - 1}</p>
                    <p className="text-sm text-gray-600">Categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {integrationCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center"
              >
                <ApperIcon name={category.icon} className="h-4 w-4 mr-2" />
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => {
            const isConnected = connectedIntegrations.has(integration.id);
            
            return (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className={`h-12 w-12 bg-gradient-to-br ${integration.color} rounded-lg flex items-center justify-center`}>
                          <ApperIcon name={integration.icon} className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-4">
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <div className="flex items-center mt-1">
                            <Badge
                              variant={isConnected ? 'success' : 'secondary'}
                              className="text-xs"
                            >
                              {isConnected ? 'Connected' : 'Available'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="mt-3">
                      {integration.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {/* Features */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
                      <ul className="space-y-1">
                        {integration.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <ApperIcon name="Check" className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <Button
                        variant={isConnected ? 'error' : 'primary'}
                        size="sm"
                        className="flex-1"
                        onClick={() => handleConnect(integration.id, integration.name)}
                      >
                        <ApperIcon 
                          name={isConnected ? 'Unlink' : 'Link'} 
                          className="h-4 w-4 mr-2" 
                        />
                        {isConnected ? 'Disconnect' : 'Connect'}
                      </Button>
                      
                      {isConnected && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConfigure(integration.name)}
                        >
                          <ApperIcon name="Settings" className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <ApperIcon name="Search" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
            <p className="text-gray-600">Try adjusting your search or category filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Integrations;