import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import Chart from "react-apexcharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Badge from "@/components/atoms/Badge"
import ApperIcon from "@/components/ApperIcon"
import UserAvatar from "@/components/molecules/UserAvatar"
import ProgressRing from "@/components/molecules/ProgressRing"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import { userService } from "@/services/api/userService"
import { enrollmentService } from "@/services/api/enrollmentService"
import { courseService } from "@/services/api/courseService"
import { activityService } from "@/services/api/activityService"

function StudentProgress() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [student, setStudent] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [courses, setCourses] = useState([])
  const [activities, setActivities] = useState([])
  const [progressData, setProgressData] = useState({
    weeklyProgress: [],
    completionRate: 0,
    totalHours: 0,
    streakDays: 0
  })

  useEffect(() => {
    loadStudentData()
  }, [studentId])

  const loadStudentData = async () => {
    try {
      setLoading(true)
      setError("")

      const [studentData, enrollmentsData, coursesData, activitiesData] = await Promise.all([
        userService.getById(studentId),
        enrollmentService.getByUserId(studentId),
        courseService.getAll(),
        activityService.getRecentActivity(20)
      ])

      setStudent(studentData)
      setEnrollments(enrollmentsData)
      setCourses(coursesData)
      
      // Filter activities for this student
      const studentActivities = activitiesData.filter(activity => 
        activity.user?.Id === parseInt(studentId)
      )
      setActivities(studentActivities)

      // Calculate progress metrics
      calculateProgressMetrics(enrollmentsData, studentActivities)

    } catch (err) {
      console.error("Failed to load student data:", err)
      setError("Failed to load student progress data")
      toast.error("Failed to load student progress")
    } finally {
      setLoading(false)
    }
  }

  const calculateProgressMetrics = (enrollmentsData, activitiesData) => {
    // Calculate overall completion rate
    const totalProgress = enrollmentsData.reduce((sum, enrollment) => 
      sum + (enrollment.progress?.overallProgress || 0), 0
    )
    const completionRate = enrollmentsData.length > 0 ? 
      Math.round(totalProgress / enrollmentsData.length) : 0

    // Mock weekly progress data (in real app, this would come from activity logs)
    const weeklyProgress = [
      { week: "Week 1", progress: 20 },
      { week: "Week 2", progress: 35 },
      { week: "Week 3", progress: 50 },
      { week: "Week 4", progress: 65 },
      { week: "Week 5", progress: 75 },
      { week: "Week 6", progress: 85 },
      { week: "Week 7", progress: completionRate }
    ]

    // Mock total hours and streak (in real app, from activity tracking)
    const totalHours = enrollmentsData.length * 12 // Estimate 12 hours per course
    const streakDays = Math.floor(Math.random() * 15) + 1 // Mock streak

    setProgressData({
      weeklyProgress,
      completionRate,
      totalHours,
      streakDays
    })
  }

  const getCourseById = (courseId) => {
    return courses.find(course => course.Id === courseId)
  }

  const getLastActiveDate = () => {
    if (activities.length === 0) return "No recent activity"
    
    const lastActivity = activities[0]
    const lastActiveDate = new Date(lastActivity.timestamp)
    const now = new Date()
    const diffMs = now - lastActiveDate
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday" 
    if (diffDays < 7) return `${diffDays} days ago`
    return lastActiveDate.toLocaleDateString()
  }

  const chartOptions = {
    chart: {
      type: 'line',
      height: 300,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    colors: ['#4F46E5'],
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 5
    },
    xaxis: {
      categories: progressData.weeklyProgress.map(item => item.week),
      labels: {
        style: { colors: '#6B7280', fontSize: '12px' }
      }
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: {
        style: { colors: '#6B7280', fontSize: '12px' },
        formatter: (value) => `${value}%`
      }
    },
    tooltip: {
      y: {
        formatter: (value) => `${value}%`
      }
    },
    markers: {
      size: 6,
      colors: ['#4F46E5'],
      strokeColors: '#fff',
      strokeWidth: 2
    }
  }

  const chartSeries = [{
    name: 'Progress',
    data: progressData.weeklyProgress.map(item => item.progress)
  }]

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadStudentData} />
  if (!student) return <Error message="Student not found" showRetry={false} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/students")}
            className="mb-4 -ml-2"
          >
            <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Student Progress
          </h1>
          <p className="text-gray-600 mt-2">
            Detailed learning analytics and progress tracking
          </p>
        </div>
      </div>

      {/* Student Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <UserAvatar user={student} size="xl" />
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900">{student.name}</h2>
              <p className="text-gray-600 mb-2">{student.email}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Joined: {new Date(student.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>Last Active: {getLastActiveDate()}</span>
                <span>•</span>
                <span className="capitalize">{student.role}</span>
              </div>
            </div>
            <div className="text-center">
              <ProgressRing 
                progress={progressData.completionRate} 
                size={80} 
                strokeWidth={6} 
              />
              <p className="text-sm text-gray-600 mt-2">Overall Progress</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                  <p className="text-3xl font-bold text-gray-900">{enrollments.length}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                  <ApperIcon name="BookOpen" className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{progressData.completionRate}%</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                  <ApperIcon name="Target" className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Learning Hours</p>
                  <p className="text-3xl font-bold text-gray-900">{progressData.totalHours}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                  <ApperIcon name="Clock" className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Learning Streak</p>
                  <p className="text-3xl font-bold text-gray-900">{progressData.streakDays}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                  <ApperIcon name="Zap" className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ApperIcon name="TrendingUp" className="h-5 w-5 mr-2" />
                Weekly Progress Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Chart
                options={chartOptions}
                series={chartSeries}
                type="line"
                height={300}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Course Enrollments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ApperIcon name="BookOpen" className="h-5 w-5 mr-2" />
                Course Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrollments.map((enrollment, index) => {
                  const course = getCourseById(enrollment.courseId)
                  if (!course) return null
                  
                  return (
                    <motion.div
                      key={enrollment.Id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{course.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {course.category}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <ProgressRing 
                            progress={enrollment.progress?.overallProgress || 0} 
                            size={48} 
                            strokeWidth={4} 
                          />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                
                {enrollments.length === 0 && (
                  <div className="text-center py-8">
                    <ApperIcon name="BookOpen" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No course enrollments yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ApperIcon name="Activity" className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.slice(0, 10).map((activity, index) => (
                <motion.div
                  key={activity.Id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.05 }}
                  className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="h-8 w-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <ApperIcon name={activity.icon} className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge 
                    variant={activity.status === 'completed' ? 'success' : 'secondary'}
                    className="text-xs"
                  >
                    {activity.status}
                  </Badge>
                </motion.div>
              ))}
              
              {activities.length === 0 && (
                <div className="text-center py-8">
                  <ApperIcon name="Activity" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default StudentProgress