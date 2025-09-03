import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/atoms/Card'
import { courseService } from '@/services/api/courseService'
import { bundleService } from '@/services/api/bundleService'
import { userService } from '@/services/api/userService'
import { enrollmentService } from '@/services/api/enrollmentService'
import ApperIcon from '@/components/ApperIcon'
import UserAvatar from '@/components/molecules/UserAvatar'
import SearchBar from '@/components/molecules/SearchBar'
import StatusBadge from '@/components/molecules/StatusBadge'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import Loading from '@/components/ui/Loading'
import Button from '@/components/atoms/Button'
import CourseActionMenu from '@/components/molecules/CourseActionMenu'

function CourseList() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [bundles, setBundles] = useState([])
  const [users, setUsers] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [creatingUrl, setCreatingUrl] = useState(null)
  const [activeTab, setActiveTab] = useState('courses')

  // Load data on component mount
  useEffect(() => {
    loadCourses()
  }, [])

  async function loadCourses() {
    try {
      setLoading(true)
      const [coursesData, bundlesData, usersData, enrollmentsData] = await Promise.all([
        courseService.getAll(),
        bundleService.getAll(),
        userService.getAll(),
        enrollmentService.getAll()
      ])
      
      setCourses(coursesData)
      setBundles(bundlesData)
      setUsers(usersData)
      setEnrollments(enrollmentsData)
    } catch (error) {
      console.error('Error loading courses:', error)
      setError(error.message)
      toast.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateCourseUrl(courseId, courseTitle) {
    try {
      setCreatingUrl(courseId)
      const updatedCourse = await courseService.generateCourseUrl(courseId)
      setCourses(prev => prev.map(c => c.Id === courseId ? updatedCourse : c))
      toast.success(`Course URL created for "${courseTitle}"`)
    } catch (error) {
      console.error('Error creating course URL:', error)
      toast.error('Failed to create course URL')
    } finally {
      setCreatingUrl(null)
    }
  }

  function handleSearch(query) {
    setSearchQuery(query)
  }

  function handleStatusFilter(status) {
    setStatusFilter(status)
  }

  async function handleDeleteCourse(courseId, courseName) {
    if (!confirm(`Are you sure you want to delete "${courseName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await courseService.delete(courseId)
      setCourses(prev => prev.filter(c => c.Id !== courseId))
      toast.success(`"${courseName}" has been deleted`)
    } catch (error) {
      console.error('Error deleting course:', error)
      toast.error('Failed to delete course')
    }
  }

  async function handleDeleteBundle(bundleId, bundleName) {
    if (!confirm(`Are you sure you want to delete "${bundleName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await bundleService.delete(bundleId)
      setBundles(prev => prev.filter(b => b.Id !== bundleId))
      toast.success(`"${bundleName}" has been deleted`)
    } catch (error) {
      console.error('Error deleting bundle:', error)
      toast.error('Failed to delete bundle')
    }
  }

  function filterCourses(query, status) {
    let filtered = [...courses]

    if (status !== 'all') {
      filtered = filtered.filter(course => course.status === status)
    }

    if (query.trim()) {
      const searchTerm = query.toLowerCase()
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchTerm) ||
        course.description.toLowerCase().includes(searchTerm) ||
        getCoachName(course.ownerId).toLowerCase().includes(searchTerm)
      )
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  function filterBundles(query, status) {
    let filtered = [...bundles]

    if (status !== 'all') {
      filtered = filtered.filter(bundle => bundle.status === status)
    }

    if (query.trim()) {
      const searchTerm = query.toLowerCase()
      filtered = filtered.filter(bundle => 
        bundle.title.toLowerCase().includes(searchTerm) ||
        bundle.description.toLowerCase().includes(searchTerm)
      )
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  function getEnrollmentCount(courseId) {
    return enrollments.filter(enrollment => enrollment.courseId === courseId).length
  }

  function getCoachName(ownerId) {
    const user = users.find(u => u.Id === ownerId)
    return user ? user.name : 'Unknown'
  }

  const filteredCourses = filterCourses(searchQuery, statusFilter)
  const filteredBundles = filterBundles(searchQuery, statusFilter)

  if (loading) {
    return <Loading message="Loading courses..." />
  }

  if (error) {
    return <Error message={error} onRetry={loadCourses} />
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Learning Content
          </h1>
          <p className="text-gray-600 mt-1">
            {activeTab === 'courses' ? 'Manage your course content and structure' : 'Create and manage course bundles'}
          </p>
        </div>
        
        <Button
          onClick={() => activeTab === 'courses' ? navigate("/courses/new") : navigate("/bundles/new")}
          className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
        >
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          {activeTab === 'courses' ? 'Create Course' : 'Create Bundle'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <Button
            variant={activeTab === 'courses' ? 'tab-active' : 'tab'}
            onClick={() => setActiveTab('courses')}
            className="pb-4 border-b-2 transition-all duration-200"
          >
            <ApperIcon name="BookOpen" className="h-5 w-5 mr-2" />
            Courses
            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              {courses.length}
            </span>
          </Button>
          <Button
            variant={activeTab === 'bundles' ? 'tab-active' : 'tab'}
            onClick={() => setActiveTab('bundles')}
            className="pb-4 border-b-2 transition-all duration-200"
          >
            <ApperIcon name="Package" className="h-5 w-5 mr-2" />
            Course Bundles
            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              {bundles.length}
            </span>
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="flex-1">
          <SearchBar
            placeholder={`Search ${activeTab}...`}
            onSearch={handleSearch}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2">
          {["all", "published", "draft", "archived"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "primary" : "outline"}
              size="sm"
              onClick={() => handleStatusFilter(status)}
            >
              {status === "all" ? `All ${activeTab === 'courses' ? 'Courses' : 'Bundles'}` : status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      {activeTab === 'courses' ? (
        filteredCourses.length === 0 ? (
          <Empty
            icon="BookOpen"
            title="No courses found"
            message={searchQuery || statusFilter !== "all" 
              ? "No courses match your current filters. Try adjusting your search or filter criteria."
              : "Get started by creating your first course with engaging content and interactive lessons."
            }
            actionLabel="Create Course"
            onAction={() => navigate("/courses/new")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <StatusBadge status={course.status} type="course" />
                      <div className="text-sm text-gray-500">
                        {getEnrollmentCount(course.Id)} students
                      </div>
                    </div>
                    <CardTitle className="group-hover:text-primary-600 transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="User" className="h-4 w-4" />
                        <span>{getCoachName(course.ownerId)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="Calendar" className="h-4 w-4" />
                        <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {course.courseUrl ? (
                        <div className="flex items-center space-x-2">
                          <ApperIcon name="ExternalLink" size={16} className="text-primary-500" />
                          <a 
                            href={`/course/${course.courseUrl}`}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {course.courseUrl}
                          </a>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCreateCourseUrl(course.Id, course.title)}
                          loading={creatingUrl === course.Id}
                          className="flex items-center space-x-1"
                        >
                          <ApperIcon name="Plus" size={14} />
                          <span>Create URL</span>
                        </Button>
                      )}
                    </div>
                    
                    <CourseActionMenu
                      courseId={course.Id}
                      courseTitle={course.title}
                      onPreview={() => navigate(`/courses/${course.Id}/play`)}
                      onEdit={() => navigate(`/courses/${course.Id}/edit`)}
                      onDelete={() => handleDeleteCourse(course.Id, course.title)}
                    />
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        filteredBundles.length === 0 ? (
          <Empty
            icon="Package"
            title="No bundles found"
            message={searchQuery || statusFilter !== "all" 
              ? "No bundles match your current filters. Try adjusting your search or filter criteria."
              : "Create your first course bundle by combining multiple courses with special pricing and features."
            }
            actionLabel="Create Bundle"
            onAction={() => navigate("/bundles/new")}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBundles.map((bundle, index) => (
              <motion.div
                key={bundle.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <StatusBadge status={bundle.status} type="bundle" />
                      <div className="text-sm text-gray-500">
                        {bundle.courses.length} courses
                      </div>
                    </div>
                    <CardTitle className="group-hover:text-primary-600 transition-colors">
                      {bundle.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {bundle.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {bundle.courses.slice(0, 3).map(courseId => {
                          const course = courses.find(c => c.Id === courseId);
                          return course ? (
                            <span key={courseId} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-700">
                              {course.title}
                            </span>
                          ) : null;
                        })}
                        {bundle.courses.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                            +{bundle.courses.length - 3} more
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <ApperIcon name="DollarSign" className="h-4 w-4" />
                          <span>
                            {bundle.pricing.type === 'free' ? 'Free' : 
                             bundle.pricing.type === 'one_time' ? `$${bundle.pricing.price}` :
                             bundle.pricing.type === 'subscription' ? `$${bundle.pricing.monthlyPrice}/mo` :
                             `$${bundle.pricing.monthlyPrice}/mo`
                            }
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ApperIcon name="Calendar" className="h-4 w-4" />
                          <span>{new Date(bundle.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      {bundle.dripSchedule.enabled && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                          <ApperIcon name="Clock" className="h-3 w-3 mr-1" />
                          Drip Enabled
                        </span>
                      )}
                    </div>
                    
                    <CourseActionMenu
                      courseId={bundle.Id}
                      courseTitle={bundle.title}
                      onPreview={() => navigate(`/bundles/${bundle.Id}/preview`)}
                      onEdit={() => navigate(`/bundles/${bundle.Id}/edit`)}
                      onDelete={() => handleDeleteBundle(bundle.Id, bundle.title)}
                    />
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

export default CourseList