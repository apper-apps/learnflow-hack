import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import SearchBar from "@/components/molecules/SearchBar"
import StatusBadge from "@/components/molecules/StatusBadge"
import UserAvatar from "@/components/molecules/UserAvatar"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import { courseService } from "@/services/api/courseService"
import { userService } from "@/services/api/userService"
import { enrollmentService } from "@/services/api/enrollmentService"

const CourseList = () => {
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [coaches, setCoaches] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const navigate = useNavigate()

  const loadCourses = async () => {
    try {
      setError("")
      setLoading(true)

      const [coursesData, coachesData, enrollmentsData] = await Promise.all([
        courseService.getAll(),
        userService.getByRole("coach"),
        enrollmentService.getAll()
      ])

      setCourses(coursesData)
      setFilteredCourses(coursesData)
      setCoaches(coachesData)
      setEnrollments(enrollmentsData)

    } catch (err) {
      console.error("Failed to load courses:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    filterCourses(query, statusFilter)
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    filterCourses(searchQuery, status)
  }

  const filterCourses = (query, status) => {
    let filtered = [...courses]

    if (query) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.description.toLowerCase().includes(query.toLowerCase())
      )
    }

    if (status !== "all") {
      filtered = filtered.filter(course => course.status === status)
    }

    setFilteredCourses(filtered)
  }

  const getEnrollmentCount = (courseId) => {
    return enrollments.filter(e => e.courseId === courseId).length
  }

  const getCoachName = (ownerId) => {
    const coach = coaches.find(c => c.Id === ownerId)
    return coach ? coach.name : "Unknown Coach"
  }

  useEffect(() => {
    loadCourses()
  }, [])

  if (loading) return <Loading type="skeleton" />
  if (error) return <Error message={error} onRetry={loadCourses} />

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Courses
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your course content and structure
          </p>
        </div>
        
        <Button
          onClick={() => navigate("/courses/new")}
          className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
        >
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
<div className="flex-1 max-w-md">
          <SearchBar
            placeholder="Search courses and transcripts..."
            onSearch={handleSearch}
            enableSemantic={true}
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
              {status === "all" ? "All Courses" : status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">{courses.length}</div>
            <div className="text-sm text-gray-600">Total Courses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success-600">
              {courses.filter(c => c.status === "published").length}
            </div>
            <div className="text-sm text-gray-600">Published</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning-600">
              {courses.filter(c => c.status === "draft").length}
            </div>
            <div className="text-sm text-gray-600">Drafts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent-600">
              {enrollments.length}
            </div>
            <div className="text-sm text-gray-600">Total Enrollments</div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
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
                
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/courses/${course.Id}/play`)
                    }}
                  >
                    <ApperIcon name="Play" className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/courses/${course.Id}/edit`)
                    }}
                  >
                    <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CourseList