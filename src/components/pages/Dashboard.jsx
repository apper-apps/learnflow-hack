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
import StatusBadge from "@/components/molecules/StatusBadge";
import ProgressRing from "@/components/molecules/ProgressRing";
import UserAvatar from "@/components/molecules/UserAvatar";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";

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
  const [error, setError] = useState("")
  const [showAllActivities, setShowAllActivities] = useState(false)
  const [dashboardData, setDashboardData] = useState({
    activities: [],
    activityStats: {},
    recentSubmissions: [],
    students: [],
    enrollments: [],
    stats: {
      totalCourses: 0,
      totalStudents: 0,
      pendingReviews: 0,
      completedDeliverables: 0
    }
  })

  const navigate = useNavigate()

  // Mock current user - in real app this would come from auth context
  const currentUser = {
    Id: 1,
    name: "Sarah Johnson",
    role: "admin"
  }

  const loadDashboardData = async () => {
    try {
      setError("")
      setLoading(true)

      // Mock data since services might not be fully implemented
      const mockActivities = [
        {
          Id: 1,
          type: "submission",
          title: "New submission received",
          description: "Student completed Lesson 3 homework",
          timestamp: new Date().toISOString(),
          icon: "FileText",
          status: "pending",
          user: { name: "John Doe" }
        }
      ]

      const mockStats = {
        totalCourses: 5,
        totalStudents: 12,
        pendingReviews: 3,
        completedDeliverables: 8
      }

      setDashboardData({
        activities: mockActivities,
        activityStats: { todaySubmissions: 2, todayLogins: 5, todayPayments: 1, todayEnrollments: 3 },
        recentSubmissions: [],
        students: [],
        enrollments: [],
        stats: mockStats
      })

    } catch (err) {
      console.error("Failed to load dashboard data:", err)
      setError(err.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  if (loading) return <Loading type="skeleton" />
  if (error) return <Error message={error} onRetry={loadDashboardData} />
  const StatCard = ({ title, value, icon, gradient, change }) => (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {value}
            </p>
            {change && (
              <p className="text-sm text-success-600 mt-1">
                <ApperIcon name="TrendingUp" className="h-4 w-4 inline mr-1" />
                {change}
              </p>
            )}
          </div>
          <div className={`h-14 w-14 rounded-full ${gradient} flex items-center justify-center`}>
            <ApperIcon name={icon} className="h-7 w-7 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Welcome back, {currentUser.name}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening in your learning platform today.
          </p>
        </div>
        
        {/* Quick Search */}
        <div className="max-w-xl">
          <SearchBar
            placeholder="Search across all course content..."
            enableSemantic={true}
            className="w-full"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Courses"
          value={dashboardData.stats.totalCourses}
          icon="BookOpen"
          gradient="bg-gradient-to-br from-primary-500 to-primary-600"
          change="+2 this month"
        />
        <StatCard
          title="Active Students"
          value={dashboardData.stats.totalStudents}
          icon="Users"
          gradient="bg-gradient-to-br from-secondary-500 to-secondary-600"
          change="+12% this week"
        />
        <StatCard
          title="Pending Reviews"
          value={dashboardData.stats.pendingReviews}
          icon="MessageSquare"
          gradient="bg-gradient-to-br from-warning-500 to-warning-600"
          change="2 urgent"
        />
        <StatCard
          title="Deliverables"
          value={dashboardData.stats.completedDeliverables}
          icon="Award"
          gradient="bg-gradient-to-br from-success-500 to-success-600"
          change="+8 this week"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
{/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Platform activity since your last login</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-500">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {dashboardData.activities.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="Activity" className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No recent activity to display</p>
                <p className="text-sm text-gray-400">Activity will appear here as users interact with the platform</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.activities.map((activity, index) => {
                  const getActivityColor = (type) => {
                    switch (type) {
                      case "submission":
                        return "from-blue-500 to-blue-600"
                      case "login":
                        return "from-green-500 to-green-600"
                      case "payment":
                        return "from-purple-500 to-purple-600"
                      case "enrollment":
                        return "from-orange-500 to-orange-600"
                      default:
                        return "from-gray-500 to-gray-600"
                    }
                  }

                  const getTimeAgo = (timestamp) => {
                    const now = new Date()
                    const date = new Date(timestamp)
                    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
                    
                    if (diffInHours < 1) return "Just now"
                    if (diffInHours < 24) return `${diffInHours}h ago`
                    const diffInDays = Math.floor(diffInHours / 24)
                    return `${diffInDays}d ago`
                  }

                  return (
                    <motion.div
key={activity.Id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className={`h-10 w-10 bg-gradient-to-br ${getActivityColor(activity.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <ApperIcon name={activity.icon} className="h-5 w-5 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {activity.title}
                          </h4>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {getTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {activity.description}
                        </p>
                        
                        <div className="flex items-center mt-2 space-x-3">
                          {activity.user && (
                            <UserAvatar 
                              user={activity.user} 
                              size="sm" 
                              className="flex-shrink-0" 
                            />
                          )}
                          
                          {activity.status && (
                            <StatusBadge 
                              status={activity.status} 
                              type={activity.type} 
                              size="sm"
                            />
                          )}
                          
                          {activity.metadata?.amount && (
                            <span className="text-xs font-medium text-green-600">
                              ${activity.metadata.amount}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                }).slice(0, showAllActivities ? dashboardData.activities.length : 5)}
                
                {dashboardData.activities.length > 5 && (
                  <div className="pt-3 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllActivities(!showAllActivities)}
                      className="w-full justify-center"
                    >
                      <ApperIcon 
                        name={showAllActivities ? "ChevronUp" : "ChevronDown"} 
                        className="h-4 w-4 mr-2" 
                      />
                      {showAllActivities ? "Show less" : `Show more (${dashboardData.activities.length - 5} remaining)`}
                    </Button>
                  </div>
                )}
                
<div className="pt-3 border-t border-gray-100 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-blue-600">
                        {dashboardData.activityStats.todaySubmissions || 0}
                      </div>
                      <div className="text-xs text-gray-500">Submissions Today</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-green-600">
                        {dashboardData.activityStats.todayLogins || 0}
                      </div>
                      <div className="text-xs text-gray-500">Logins Today</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-purple-600">
                        {dashboardData.activityStats.todayPayments || 0}
                      </div>
                      <div className="text-xs text-gray-500">Payments Today</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-orange-600">
                        {dashboardData.activityStats.todayEnrollments || 0}
                      </div>
                      <div className="text-xs text-gray-500">New Members Today</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Latest student work</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/reviews")}
              >
                Review All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.recentSubmissions.map((submission, index) => (
              <motion.div
                key={submission.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-primary-200 hover:bg-primary-50 transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/submissions/${submission.Id}`)}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center">
                    <ApperIcon name="FileText" className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Lesson {submission.lessonId} Submission
                    </h4>
                    <p className="text-sm text-gray-500">
                      Student {submission.studentId} • {new Date(submission.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <StatusBadge status={submission.status} type="submission" />
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Students Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Active Students</CardTitle>
              <CardDescription>Recent student activity and progress</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/students")}
            >
              Manage Students
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardData.students.map((student, index) => {
              const enrollment = dashboardData.enrollments.find(e => e.userId === student.Id)
              const progress = enrollment?.progress?.overallProgress || 0

              return (
                <motion.div
                  key={student.Id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-4 border border-gray-100 rounded-lg hover:border-primary-200 hover:bg-primary-50 transition-all duration-200"
                >
                  <UserAvatar user={student} size="md" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{student.name}</h4>
                    <p className="text-sm text-gray-500">Progress: {progress}%</p>
                  </div>
                  <ProgressRing progress={progress} size={36} strokeWidth={3} />
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

{/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="flex items-center justify-center h-24 flex-col space-y-2"
              onClick={() => navigate('/search')}
            >
              <ApperIcon name="Search" className="h-6 w-6" />
              <span>Semantic Search</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-20 flex-col"
              onClick={() => navigate("/courses/new")}
            >
              <ApperIcon name="Plus" className="h-6 w-6 mb-2" />
              Create Course
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-20 flex-col"
              onClick={() => navigate("/students")}
            >
              <ApperIcon name="UserPlus" className="h-6 w-6 mb-2" />
              Add Student
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-20 flex-col"
              onClick={() => navigate("/reviews")}
            >
              <ApperIcon name="Eye" className="h-6 w-6 mb-2" />
              Review Submissions
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-20 flex-col"
              onClick={() => navigate("/deliverables")}
            >
              <ApperIcon name="Award" className="h-6 w-6 mb-2" />
              View Deliverables
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard