import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/Card";
import { activityService } from "@/services/api/activityService";
import { submissionService } from "@/services/api/submissionService";
import { userService } from "@/services/api/userService";
import { enrollmentService } from "@/services/api/enrollmentService";
import ApperIcon from "@/components/ApperIcon";
import ProgressRing from "@/components/molecules/ProgressRing";
import UserAvatar from "@/components/molecules/UserAvatar";
import SearchBar from "@/components/molecules/SearchBar";
import StatusBadge from "@/components/molecules/StatusBadge";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";

// StatCard Component
const StatCard = ({ title, value, icon, gradient, change }) => (
  <Card className="hover:shadow-lg transition-all duration-200">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="text-xs text-gray-500 mt-1">{change}</p>
          )}
        </div>
        <div className={`h-12 w-12 ${gradient} rounded-lg flex items-center justify-center`}>
          <ApperIcon name={icon} className="h-6 w-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
)

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalStudents: 0,
      activeCourses: 0,
      pendingReviews: 0,
      completionRate: 0
    },
    activities: [],
    recentSubmissions: []
  })
  const navigate = useNavigate()

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load data from services
      const [users, enrollments, submissions, activities] = await Promise.all([
        userService.getAll(),
        enrollmentService.getAll(),
        submissionService.getAll(),
        activityService.getAll()
      ])

      // Calculate stats
      const totalStudents = users.filter(user => user.role === 'student').length
      const activeCourses = [...new Set(enrollments.map(e => e.courseId))].length
      const pendingReviews = submissions.filter(s => s.status === 'submitted').length
      const completedSubmissions = submissions.filter(s => s.status === 'graded').length
      const completionRate = submissions.length > 0 ? Math.round((completedSubmissions / submissions.length) * 100) : 0

      // Get recent activities and submissions
      const recentActivities = activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 6)

      const recentSubmissions = submissions
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 5)

      setDashboardData({
        stats: {
          totalStudents,
          activeCourses,
          pendingReviews,
          completionRate
        },
        activities: recentActivities,
        recentSubmissions
      })
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      setError('Failed to load dashboard data')
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Helper functions
  const getActivityColor = (type) => {
    switch (type) {
      case 'submission': return 'bg-blue-100 text-blue-600'
      case 'completion': return 'bg-green-100 text-green-600'
      case 'enrollment': return 'bg-purple-100 text-purple-600'
      case 'review': return 'bg-orange-100 text-orange-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now - time) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadDashboardData} />

  const { stats, activities, recentSubmissions } = dashboardData

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening with your courses.</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/courses/new')}
                className="bg-gradient-to-r from-primary-600 to-secondary-600"
              >
                <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                New Course
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/students')}
              >
                <ApperIcon name="Users" className="h-4 w-4 mr-2" />
                Manage Students
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              icon="Users"
              gradient="bg-gradient-to-r from-blue-500 to-blue-600"
              change="+12% from last month"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatCard
              title="Active Courses"
              value={stats.activeCourses}
              icon="BookOpen"
              gradient="bg-gradient-to-r from-green-500 to-green-600"
              change="+3 new this week"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatCard
              title="Pending Reviews"
              value={stats.pendingReviews}
              icon="MessageSquare"
              gradient="bg-gradient-to-r from-orange-500 to-orange-600"
              change="Needs attention"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatCard
              title="Completion Rate"
              value={`${stats.completionRate}%`}
              icon="TrendingUp"
              gradient="bg-gradient-to-r from-purple-500 to-purple-600"
              change="+5% this month"
            />
          </motion.div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ApperIcon name="Activity" className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest updates from your courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.Id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                        <ApperIcon name={activity.icon || 'Bell'} className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <ApperIcon name="Inbox" className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/reviews')}
                    className="w-full justify-center"
                  >
                    View All Activity
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Submissions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ApperIcon name="FileText" className="h-5 w-5 mr-2" />
                  Recent Submissions
                </CardTitle>
                <CardDescription>Latest student submissions for review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSubmissions.map((submission) => (
                    <div 
                      key={submission.Id} 
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/submissions/${submission.Id}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <UserAvatar 
                          user={{ Id: submission.studentId, name: `Student ${submission.studentId}` }} 
                          size="sm" 
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {submission.title || `Assignment ${submission.Id}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {getTimeAgo(submission.submittedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={submission.status} size="sm" />
                        <ApperIcon name="ChevronRight" className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                  {recentSubmissions.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <ApperIcon name="FileX" className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent submissions</p>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/reviews')}
                    className="w-full justify-center"
                  >
                    View All Submissions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ApperIcon name="Zap" className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks to get things done quickly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => navigate('/courses')}
                >
                  <ApperIcon name="BookOpen" className="h-6 w-6" />
                  <span className="text-sm">Browse Courses</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => navigate('/search')}
                >
                  <ApperIcon name="Search" className="h-6 w-6" />
                  <span className="text-sm">Semantic Search</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2"
                  onClick={() => navigate('/deliverables')}
                >
                  <ApperIcon name="Award" className="h-6 w-6" />
                  <span className="text-sm">Track Deliverables</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard