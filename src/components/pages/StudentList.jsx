import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Select from "@/components/atoms/Select"
import ApperIcon from "@/components/ApperIcon"
import SearchBar from "@/components/molecules/SearchBar"
import UserAvatar from "@/components/molecules/UserAvatar"
import ProgressRing from "@/components/molecules/ProgressRing"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import { userService } from "@/services/api/userService"
import { enrollmentService } from "@/services/api/enrollmentService"
import { courseService } from "@/services/api/courseService"

const StudentList = () => {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    courseId: ""
  })

  const loadData = async () => {
    try {
      setError("")
      setLoading(true)

      const [studentsData, coursesData, enrollmentsData] = await Promise.all([
        userService.getByRole("student"),
        courseService.getAll(),
        enrollmentService.getAll()
      ])

      setStudents(studentsData)
      setFilteredStudents(studentsData)
      setCourses(coursesData)
      setEnrollments(enrollmentsData)

    } catch (err) {
      console.error("Failed to load data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(query.toLowerCase()) ||
      student.email.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredStudents(filtered)
  }

  const handleAddStudent = async () => {
    try {
      if (!formData.name || !formData.email) {
        toast.error("Please fill in all required fields")
        return
      }

      const newStudent = await userService.create({
        name: formData.name,
        email: formData.email,
        role: "student"
      })

      // Enroll in course if selected
      if (formData.courseId) {
        await enrollmentService.create({
          userId: newStudent.Id,
          courseId: parseInt(formData.courseId)
        })
      }

      toast.success("Student added successfully!")
      setFormData({ name: "", email: "", courseId: "" })
      setShowAddForm(false)
      loadData()

    } catch (err) {
      toast.error("Failed to add student: " + err.message)
    }
  }

  const getStudentProgress = (studentId) => {
    const studentEnrollments = enrollments.filter(e => e.userId === studentId)
    if (studentEnrollments.length === 0) return 0
    
    const totalProgress = studentEnrollments.reduce((sum, enrollment) => 
      sum + (enrollment.progress?.overallProgress || 0), 0
    )
    return Math.round(totalProgress / studentEnrollments.length)
  }

  const getEnrolledCourses = (studentId) => {
    return enrollments.filter(e => e.userId === studentId).length
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) return <Loading type="skeleton" />
  if (error) return <Error message={error} onRetry={loadData} />

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Students
          </h1>
          <p className="text-gray-600 mt-1">
            Manage student enrollments and track progress
          </p>
        </div>
        
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
        >
          <ApperIcon name="UserPlus" className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Add Student Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Add New Student</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                <ApperIcon name="X" className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Student Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter student name"
              />
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="student@example.com"
              />
              <Select
                label="Enroll in Course (Optional)"
                value={formData.courseId}
                onChange={(e) => setFormData({...formData, courseId: e.target.value})}
              >
                <option value="">Select a course</option>
                {courses.filter(c => c.status === "published").map(course => (
                  <option key={course.Id} value={course.Id}>
                    {course.title}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddStudent}>
                Add Student
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar
            placeholder="Search students..."
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">{students.length}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success-600">{enrollments.length}</div>
            <div className="text-sm text-gray-600">Active Enrollments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent-600">
              {Math.round(enrollments.reduce((sum, e) => sum + (e.progress?.overallProgress || 0), 0) / Math.max(enrollments.length, 1))}%
            </div>
            <div className="text-sm text-gray-600">Avg. Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning-600">
              {courses.filter(c => c.status === "published").length}
            </div>
            <div className="text-sm text-gray-600">Available Courses</div>
          </CardContent>
        </Card>
      </div>

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <Empty
          icon="Users"
          title="No students found"
          message={searchQuery 
            ? "No students match your search criteria. Try a different search term."
            : "Get started by adding your first student to the platform."
          }
          actionLabel="Add Student"
          onAction={() => setShowAddForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student, index) => (
            <motion.div
              key={student.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <UserAvatar user={student} size="lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {student.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {student.email}
                      </p>
                    </div>
                    <ProgressRing 
                      progress={getStudentProgress(student.Id)} 
                      size={48} 
                      strokeWidth={4} 
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Enrolled Courses:</span>
                      <span className="font-medium">{getEnrolledCourses(student.Id)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Overall Progress:</span>
                      <span className="font-medium">{getStudentProgress(student.Id)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Joined:</span>
                      <span className="font-medium">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <ApperIcon name="MessageSquare" className="h-4 w-4 mr-2" />
Message
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.location.href = `/students/${student.Id}/progress`}
                    >
                      <ApperIcon name="BarChart3" className="h-4 w-4 mr-2" />
                      Progress
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StudentList