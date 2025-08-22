import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import ProgressRing from "@/components/molecules/ProgressRing"
import StatusBadge from "@/components/molecules/StatusBadge"
import UserAvatar from "@/components/molecules/UserAvatar"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import { courseService } from "@/services/api/courseService"
import { submissionService } from "@/services/api/submissionService"
import { userService } from "@/services/api/userService"
import { enrollmentService } from "@/services/api/enrollmentService"

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dashboardData, setDashboardData] = useState({
    courses: [],
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

      const [courses, submissions, students, enrollments] = await Promise.all([
        courseService.getAll(),
        submissionService.getAll(),
        userService.getByRole("student"),
        enrollmentService.getAll()
      ])

      const stats = {
        totalCourses: courses.length,
        totalStudents: students.length,
        pendingReviews: submissions.filter(s => s.status === "pending").length,
        completedDeliverables: submissions.filter(s => s.status === "approved").length
      }

      setDashboardData({
        courses: courses.slice(0, 6), // Show recent courses
        recentSubmissions: submissions.slice(0, 5),
        students: students.slice(0, 8),
        enrollments,
        stats
      })

    } catch (err) {
      console.error("Failed to load dashboard data:", err)
      setError(err.message)
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
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          Welcome back, {currentUser.name}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening in your learning platform today.
        </p>
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
        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Courses</CardTitle>
                <CardDescription>Your latest course content</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/courses")}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.courses.map((course, index) => (
              <motion.div
                key={course.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-primary-200 hover:bg-primary-50 transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/courses/${course.Id}/edit`)}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                    <ApperIcon name="BookOpen" className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{course.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-1">{course.description}</p>
                  </div>
                </div>
                <StatusBadge status={course.status} type="course" />
              </motion.div>
            ))}
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