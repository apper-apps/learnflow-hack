import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Select from "@/components/atoms/Select"
import ApperIcon from "@/components/ApperIcon"
import SearchBar from "@/components/molecules/SearchBar"
import StatusBadge from "@/components/molecules/StatusBadge"
import UserAvatar from "@/components/molecules/UserAvatar"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import { submissionService } from "@/services/api/submissionService"
import { userService } from "@/services/api/userService"
import { lessonService } from "@/services/api/courseService"

const ReviewInbox = () => {
  const [submissions, setSubmissions] = useState([])
  const [filteredSubmissions, setFilteredSubmissions] = useState([])
  const [students, setStudents] = useState([])
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const navigate = useNavigate()

  const loadData = async () => {
    try {
      setError("")
      setLoading(true)

      const [submissionsData, studentsData, lessonsData] = await Promise.all([
        submissionService.getAll(),
        userService.getByRole("student"),
        lessonService.getAll()
      ])

      setSubmissions(submissionsData.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)))
      setFilteredSubmissions(submissionsData.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)))
      setStudents(studentsData)
      setLessons(lessonsData)

    } catch (err) {
      console.error("Failed to load data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    filterSubmissions(query, statusFilter, priorityFilter)
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    filterSubmissions(searchQuery, status, priorityFilter)
  }

  const handlePriorityFilter = (priority) => {
    setPriorityFilter(priority)
    filterSubmissions(searchQuery, statusFilter, priority)
  }

  const filterSubmissions = (query, status, priority) => {
    let filtered = [...submissions]

    if (query) {
      filtered = filtered.filter(submission => {
        const student = getStudentName(submission.studentId).toLowerCase()
        const lesson = getLessonTitle(submission.lessonId).toLowerCase()
        const content = submission.content.toLowerCase()
        return student.includes(query.toLowerCase()) || 
               lesson.includes(query.toLowerCase()) || 
               content.includes(query.toLowerCase())
      })
    }

    if (status !== "all") {
      filtered = filtered.filter(submission => submission.status === status)
    }

    if (priority !== "all") {
      // Mock priority logic based on submission age
      filtered = filtered.filter(submission => {
        const daysSinceSubmission = Math.floor((Date.now() - new Date(submission.submittedAt)) / (1000 * 60 * 60 * 24))
        if (priority === "urgent" && daysSinceSubmission > 2) return true
        if (priority === "normal" && daysSinceSubmission <= 2) return true
        return false
      })
    }

    setFilteredSubmissions(filtered)
  }

  const getStudentName = (studentId) => {
    const student = students.find(s => s.Id === studentId)
    return student ? student.name : "Unknown Student"
  }

  const getStudent = (studentId) => {
    return students.find(s => s.Id === studentId)
  }

  const getLessonTitle = (lessonId) => {
    const lesson = lessons.find(l => l.Id === lessonId)
    return lesson ? lesson.title : "Unknown Lesson"
  }

  const getSubmissionPriority = (submission) => {
    const daysSinceSubmission = Math.floor((Date.now() - new Date(submission.submittedAt)) / (1000 * 60 * 60 * 24))
    return daysSinceSubmission > 2 ? "urgent" : "normal"
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) return <Loading type="skeleton" />
  if (error) return <Error message={error} onRetry={loadData} />

  const getStatusCounts = () => {
    return {
      pending: submissions.filter(s => s.status === "pending").length,
      approved: submissions.filter(s => s.status === "approved").length,
      changes_requested: submissions.filter(s => s.status === "changes_requested").length
    }
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          Review Inbox
        </h1>
        <p className="text-gray-600 mt-1">
          Review and provide feedback on student submissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning-600">{statusCounts.pending}</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success-600">{statusCounts.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-error-600">{statusCounts.changes_requested}</div>
            <div className="text-sm text-gray-600">Changes Requested</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">{submissions.length}</div>
            <div className="text-sm text-gray-600">Total Submissions</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar
            placeholder="Search submissions..."
            onSearch={handleSearch}
          />
        </div>
        
        <div className="flex gap-3">
          <Select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="w-40"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="changes_requested">Changes Requested</option>
          </Select>
          
          <Select
            value={priorityFilter}
            onChange={(e) => handlePriorityFilter(e.target.value)}
            className="w-40"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="normal">Normal</option>
          </Select>
        </div>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <Empty
          icon="MessageSquare"
          title="No submissions found"
          message={searchQuery || statusFilter !== "all" || priorityFilter !== "all"
            ? "No submissions match your current filters. Try adjusting your search or filter criteria."
            : "No student submissions to review at the moment. Submissions will appear here as students complete their homework."
          }
          showAction={false}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-900">Student</th>
                    <th className="text-left p-4 font-medium text-gray-900">Lesson</th>
                    <th className="text-left p-4 font-medium text-gray-900">Content Preview</th>
                    <th className="text-left p-4 font-medium text-gray-900">Status</th>
                    <th className="text-left p-4 font-medium text-gray-900">Priority</th>
                    <th className="text-left p-4 font-medium text-gray-900">Submitted</th>
                    <th className="text-right p-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSubmissions.map((submission, index) => {
                    const student = getStudent(submission.studentId)
                    const priority = getSubmissionPriority(submission)
                    
                    return (
                      <motion.tr
                        key={submission.Id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/submissions/${submission.Id}`)}
                      >
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <UserAvatar user={student} size="sm" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {getStudentName(submission.studentId)}
                              </div>
                              <div className="text-sm text-gray-500">Student</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">
                            {getLessonTitle(submission.lessonId)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Lesson {submission.lessonId}
                          </div>
                        </td>
                        <td className="p-4 max-w-xs">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {submission.content}
                          </p>
                          {submission.files.length > 0 && (
                            <div className="flex items-center mt-1 text-xs text-gray-500">
                              <ApperIcon name="Paperclip" className="h-3 w-3 mr-1" />
                              {submission.files.length} file{submission.files.length > 1 ? "s" : ""}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <StatusBadge status={submission.status} type="submission" />
                        </td>
                        <td className="p-4">
                          <div className={`flex items-center gap-1 text-sm ${
                            priority === "urgent" ? "text-error-600" : "text-gray-600"
                          }`}>
                            <ApperIcon 
                              name={priority === "urgent" ? "AlertTriangle" : "Clock"} 
                              className="h-4 w-4" 
                            />
                            {priority === "urgent" ? "Urgent" : "Normal"}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-900">
                            {formatTimeAgo(submission.submittedAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/submissions/${submission.Id}`)
                            }}
                          >
                            <ApperIcon name="Eye" className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ReviewInbox