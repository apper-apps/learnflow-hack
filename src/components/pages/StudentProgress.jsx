import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Chart from "react-apexcharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import { userService } from "@/services/api/userService";
import { enrollmentService } from "@/services/api/enrollmentService";
import { courseService } from "@/services/api/courseService";
import { activityService } from "@/services/api/activityService";
import ApperIcon from "@/components/ApperIcon";
import ProgressRing from "@/components/molecules/ProgressRing";
import UserAvatar from "@/components/molecules/UserAvatar";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";

function StudentProgress() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [student, setStudent] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [courses, setCourses] = useState([])
  const [activities, setActivities] = useState([])
  const [activeModal, setActiveModal] = useState(null)
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
          <Card 
            onClick={() => setActiveModal('courses')}
            className="cursor-pointer hover:shadow-lg"
          >
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
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <ApperIcon name="Eye" className="h-3 w-3 mr-1" />
                Click to view details
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card 
            onClick={() => setActiveModal('completion')}
            className="cursor-pointer hover:shadow-lg"
          >
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
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <ApperIcon name="Eye" className="h-3 w-3 mr-1" />
                Click to view breakdown
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card 
            onClick={() => setActiveModal('hours')}
            className="cursor-pointer hover:shadow-lg"
          >
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
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <ApperIcon name="Eye" className="h-3 w-3 mr-1" />
                Click to view timeline
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card 
            onClick={() => setActiveModal('streak')}
            className="cursor-pointer hover:shadow-lg"
          >
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
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <ApperIcon name="Eye" className="h-3 w-3 mr-1" />
                Click to view history
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modal Overlays */}
      {activeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveModal(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeModal === 'courses' && 'Enrolled Courses Details'}
                {activeModal === 'completion' && 'Completion Rate Breakdown'}
                {activeModal === 'hours' && 'Learning Hours Timeline'}
                {activeModal === 'streak' && 'Learning Streak History'}
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ApperIcon name="X" className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)] custom-scrollbar">
              {activeModal === 'courses' && (
                <div className="space-y-4">
                  {courses.map((course, index) => {
                    const enrollment = enrollments.find(e => e.courseId === course.Id)
                    const courseProgress = enrollment ? Math.round((enrollment.completedLessons / course.totalLessons) * 100) : 0
                    
                    return (
                      <motion.div
                        key={course.Id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                            <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <ProgressRing progress={courseProgress} size={32} strokeWidth={3} />
                                <span className="ml-2 text-sm text-gray-600">{courseProgress}% complete</span>
                              </div>
                              <Badge variant={enrollment?.status === 'completed' ? 'success' : enrollment?.status === 'in_progress' ? 'warning' : 'secondary'}>
                                {enrollment?.status || 'not_started'}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500 ml-4">
                            <div>{enrollment?.completedLessons || 0} / {course.totalLessons} lessons</div>
                            <div className="mt-1">{course.duration} total</div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {activeModal === 'completion' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">{progressData.completionRate}%</div>
                      <p className="text-gray-600">Overall Completion Rate</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    {courses.map((course, index) => {
                      const enrollment = enrollments.find(e => e.courseId === course.Id)
                      const courseProgress = enrollment ? Math.round((enrollment.completedLessons / course.totalLessons) * 100) : 0
                      
                      return (
                        <motion.div
                          key={course.Id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{course.title}</h4>
                            <p className="text-sm text-gray-500">{enrollment?.completedLessons || 0} of {course.totalLessons} lessons completed</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <motion.div
                                className="h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${courseProgress}%` }}
                                transition={{ delay: index * 0.1 + 0.3 }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700 w-12">{courseProgress}%</span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}

              {activeModal === 'hours' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600 mb-2">{progressData.totalHours}</div>
                      <p className="text-gray-600">Total Learning Hours</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{Math.round(progressData.totalHours / 7)}</div>
                      <p className="text-sm text-gray-600">Hours/Week Avg</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{Math.round(progressData.totalHours / 30)}</div>
                      <p className="text-sm text-gray-600">Hours/Day Avg</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{courses.length > 0 ? Math.round(progressData.totalHours / courses.length) : 0}</div>
                      <p className="text-sm text-gray-600">Hours/Course Avg</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Recent Activity</h4>
                    {Array.from({length: 7}).map((_, index) => {
                      const date = new Date()
                      date.setDate(date.getDate() - index)
                      const hours = Math.random() * 3 + 0.5
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <ApperIcon name="Clock" className="h-4 w-4 text-purple-600" />
                            </div>
                            <span className="text-sm text-gray-700">
                              {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{hours.toFixed(1)}h</span>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}

              {activeModal === 'streak' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-orange-600 mb-2">{progressData.streakDays}</div>
                      <p className="text-gray-600">Current Learning Streak</p>
                      <p className="text-sm text-gray-500 mt-1">Keep it up! 🔥</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">28</div>
                      <p className="text-sm text-gray-600">Longest Streak</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">85</div>
                      <p className="text-sm text-gray-600">Total Active Days</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Recent Activity Streak</h4>
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({length: 21}).map((_, index) => {
                        const isActive = index < progressData.streakDays || Math.random() > 0.3
                        const date = new Date()
                        date.setDate(date.getDate() - (20 - index))
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.02 }}
                            className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 text-xs ${
                              isActive 
                                ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' 
                                : 'bg-gray-100 text-gray-400'
                            }`}
                            title={date.toLocaleDateString()}
                          >
                            <div className="font-medium">{date.getDate()}</div>
                            {isActive && <div className="text-[10px]">✓</div>}
                          </motion.div>
                        )
                      })}
                    </div>
                    <p className="text-xs text-gray-500 text-center">Last 3 weeks</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <ApperIcon name="Lightbulb" className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Streak Tips</p>
                        <p className="text-sm text-blue-700 mt-1">Study for at least 15 minutes daily to maintain your streak. Set up study reminders to stay consistent!</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

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