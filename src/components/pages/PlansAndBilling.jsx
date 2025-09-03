import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';

const PlansAndBilling = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);

  const plans = [
    {
      Id: 1,
      name: 'Starter',
      price: 29,
      interval: 'month',
      features: [
        'Up to 5 courses',
        '100 students',
        'Basic analytics',
        'Email support',
        '10GB storage'
      ],
      popular: false
    },
    {
      Id: 2,
      name: 'Professional',
      price: 79,
      interval: 'month',
      features: [
        'Unlimited courses',
        '500 students',
        'Advanced analytics',
        'Priority support',
        '50GB storage',
        'Custom branding',
        'Integration support'
      ],
      popular: true
    },
    {
      Id: 3,
      name: 'Enterprise',
      price: 199,
      interval: 'month',
      features: [
        'Unlimited everything',
        'Unlimited students',
        'Custom analytics',
        '24/7 phone support',
        'Unlimited storage',
        'White-label solution',
        'Custom integrations',
        'Dedicated account manager'
      ],
      popular: false
    }
  ];

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentPlan({
        Id: 2,
        name: 'Professional',
        price: 79,
        renewDate: '2024-02-15',
        status: 'active'
      });

      setBillingHistory([
        { Id: 1, date: '2024-01-15', amount: 79, plan: 'Professional', status: 'paid' },
        { Id: 2, date: '2023-12-15', amount: 79, plan: 'Professional', status: 'paid' },
        { Id: 3, date: '2023-11-15', amount: 29, plan: 'Starter', status: 'paid' }
      ]);
    } catch (err) {
      setError('Failed to load billing information');
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (plan) => {
    if (plan.Id === currentPlan?.Id) {
      toast.info('You are already on this plan');
      return;
    }

    const isUpgrade = plan.price > (currentPlan?.price || 0);
    const action = isUpgrade ? 'upgrade' : 'downgrade';
    
    if (window.confirm(`Are you sure you want to ${action} to the ${plan.name} plan for $${plan.price}/month?`)) {
      toast.success(`Successfully ${action}d to ${plan.name} plan! Changes will take effect immediately.`);
      setCurrentPlan({
        Id: plan.Id,
        name: plan.name,
        price: plan.price,
        renewDate: '2024-03-15',
        status: 'active'
      });
    }
  };

  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing cycle.')) {
      toast.success('Subscription cancelled. You will retain access until your current billing period ends.');
      setCurrentPlan(prev => ({ ...prev, status: 'cancelled' }));
    }
  };

  const downloadInvoice = (invoice) => {
    toast.success(`Invoice for ${invoice.date} downloaded successfully!`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
                  <ApperIcon name="CreditCard" size={28} />
                  Plans & Billing
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your subscription and billing information
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Current Plan */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Plan</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <ApperIcon name="Crown" size={24} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{currentPlan?.name}</h3>
                  <p className="text-sm text-gray-500">
                    ${currentPlan?.price}/month • Next billing: {formatDate(currentPlan?.renewDate)}
                  </p>
                </div>
                <Badge variant={currentPlan?.status === 'active' ? 'success' : 'warning'}>
                  {currentPlan?.status === 'active' ? 'Active' : 'Cancelled'}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelSubscription}
                  className="text-error-600 hover:text-error-700"
                >
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </Card>

          {/* Available Plans */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card 
                  key={plan.Id} 
                  className={`p-6 relative ${plan.popular ? 'ring-2 ring-primary-500' : ''}`}
                >
                  {plan.popular && (
                    <Badge 
                      variant="primary" 
                      className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                    >
                      Most Popular
                    </Badge>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      ${plan.price}
                      <span className="text-sm font-normal text-gray-500">/{plan.interval}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <ApperIcon name="Check" size={16} className="text-success-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.Id === currentPlan?.Id ? "outline" : "primary"}
                    className="w-full"
                    onClick={() => handleUpgrade(plan)}
                    disabled={plan.Id === currentPlan?.Id && currentPlan?.status === 'active'}
                  >
                    {plan.Id === currentPlan?.Id 
                      ? 'Current Plan' 
                      : plan.price > (currentPlan?.price || 0) 
                        ? 'Upgrade' 
                        : 'Downgrade'
                    }
                  </Button>
                </Card>
              ))}
            </div>
          </div>

          {/* Billing History */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Billing History</h2>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => toast.success('Billing statements exported to email!')}
              >
                <ApperIcon name="Download" size={16} />
                Export
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Plan</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Amount</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map((invoice) => (
                    <tr key={invoice.Id} className="border-b border-gray-100">
                      <td className="py-3 px-2 text-sm text-gray-900">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-900">{invoice.plan}</td>
                      <td className="py-3 px-2 text-sm text-gray-900">${invoice.amount}</td>
                      <td className="py-3 px-2">
                        <Badge variant="success">Paid</Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadInvoice(invoice)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <ApperIcon name="Download" size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Payment Methods */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
              <Button
                variant="primary"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => toast.success('Add payment method functionality coming soon!')}
              >
                <ApperIcon name="Plus" size={16} />
                Add Method
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded">
                    <ApperIcon name="CreditCard" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                    <p className="text-sm text-gray-500">Expires 12/25 • Primary</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm" className="text-error-600">Remove</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlansAndBilling;