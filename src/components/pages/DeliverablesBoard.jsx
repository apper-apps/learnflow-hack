import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
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

const DeliverablesBoard = () => {
  const [deliverables, setDeliverables] = useState([])
  const [filteredDeliverables, setFilteredDeliverables] = useState([])
  const [students, setStudents] = useState([])
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("approved")

  const navigate = useNavigate()

  // Mock current user - in real app this would come from auth context
  const currentUser = {
    Id: 1,
    name: "Sarah Johnson",
    role: "admin"
  }

  const loadData = async () => {
    try {
      setError("")
      setLoading(true)

      const [submissionsData, studentsData, lessonsData] = await Promise.all([
        submissionService.getAll(),
        userService.getByRole("student"),
        lessonService.getAll()
      ])

      // Transform submissions into deliverables format
      const deliverableData = submissionsData.map(submission => ({
        ...submission,
        deliverableId: `DEL-${submission.Id}`,
        approvedAt: submission.status === "approved" ? submission.submittedAt : null
      }))

      setDeliverables(deliverableData.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)))
      setFilteredDeliverables(deliverableData.filter(d => d.status === "approved"))
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
    filterDeliverables(query, activeTab)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    filterDeliverables(searchQuery, tab)
  }

  const filterDeliverables = (query, tab) => {
    let filtered = [...deliverables]

    // Filter by tab/status
    switch (tab) {
      case "approved":
        filtered = filtered.filter(d => d.status === "approved")
        break
      case "awaiting":
        filtered = filtered.filter(d => d.status === "pending")
        break
      case "changes":
        filtered = filtered.filter(d => d.status === "changes_requested")
        break
      default:
        break
    }

    // Filter by search query
    if (query) {
      filtered = filtered.filter(deliverable => {
        const student = getStudentName(deliverable.studentId).toLowerCase()
        const lesson = getLessonTitle(deliverable.lessonId).toLowerCase()
        const content = deliverable.content.toLowerCase()
        return student.includes(query.toLowerCase()) || 
               lesson.includes(query.toLowerCase()) || 
               content.includes(query.toLowerCase())
      })
    }

    setFilteredDeliverables(filtered)
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

  const getStatusCounts = () => {
    return {
      approved: deliverables.filter(d => d.status === "approved").length,
      awaiting: deliverables.filter(d => d.status === "pending").length,
      changes: deliverables.filter(d => d.status === "changes_requested").length
    }
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

  useEffect(() => {
    filterDeliverables(searchQuery, activeTab)
  }, [deliverables])

  if (loading) return <Loading type="skeleton" />
  if (error) return <Error message={error} onRetry={loadData} />

  const statusCounts = getStatusCounts()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Deliverables Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Track student progress and completed work
          </p>
        </div>
        
        {currentUser.role === "admin" && (
          <Button onClick={() => navigate("/reviews")}>
            <ApperIcon name="MessageSquare" className="h-4 w-4 mr-2" />
            Review Submissions
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success-600">{statusCounts.approved}</div>
            <div className="text-sm text-gray-600">Approved Deliverables</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning-600">{statusCounts.awaiting}</div>
            <div className="text-sm text-gray-600">Awaiting Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-error-600">{statusCounts.changes}</div>
            <div className="text-sm text-gray-600">Needs Changes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">{deliverables.length}</div>
            <div className="text-sm text-gray-600">Total Submissions</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar
            placeholder="Search deliverables..."
            onSearch={handleSearch}
          />
        </div>
        
        {/* Status Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { id: "approved", label: "Approved", count: statusCounts.approved, color: "success" },
            { id: "awaiting", label: "Awaiting Review", count: statusCounts.awaiting, color: "warning" },
            { id: "changes", label: "Needs Changes", count: statusCounts.changes, color: "error" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                activeTab === tab.id
                  ? `bg-${tab.color}-100 text-${tab.color}-700`
                  : "bg-gray-200 text-gray-600"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Deliverables Grid */}
      {filteredDeliverables.length === 0 ? (
        <Empty
          icon="Award"
          title={`No ${activeTab === "approved" ? "approved deliverables" : 
                     activeTab === "awaiting" ? "submissions awaiting review" : 
                     "submissions needing changes"} found`}
          message={searchQuery 
            ? "No deliverables match your search criteria. Try a different search term."
            : activeTab === "approved" 
              ? "No approved deliverables yet. Submissions will appear here once approved by coaches."
              : activeTab === "awaiting"
                ? "No submissions currently awaiting review. All caught up!"
                : "No submissions currently need changes. Great work!"
          }
          showAction={false}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeliverables.map((deliverable, index) => {
            const student = getStudent(deliverable.studentId)
            
            return (
              <motion.div
                key={deliverable.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <StatusBadge status={deliverable.status} type="submission" />
                      <span className="text-xs font-mono text-gray-500">
                        {deliverable.deliverableId}
                      </span>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary-600 transition-colors">
                      {getLessonTitle(deliverable.lessonId)}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Student Info */}
                    <div className="flex items-center space-x-3">
                      <UserAvatar user={student} size="sm" />
                      <div>
                        <div className="font-medium text-gray-900">{student?.name}</div>
                        <div className="text-sm text-gray-500">Student</div>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Response Preview:</h4>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {deliverable.content}
                      </p>
                    </div>

                    {/* Files */}
                    {deliverable.files && deliverable.files.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <ApperIcon name="Paperclip" className="h-4 w-4" />
                        <span>{deliverable.files.length} attachment{deliverable.files.length > 1 ? "s" : ""}</span>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="space-y-1 text-sm text-gray-500">
                      <div className="flex items-center justify-between">
                        <span>Submitted:</span>
                        <span>{formatTimeAgo(deliverable.submittedAt)}</span>
                      </div>
                      {deliverable.status === "approved" && deliverable.approvedAt && (
                        <div className="flex items-center justify-between">
                          <span>Approved:</span>
                          <span>{formatTimeAgo(deliverable.approvedAt)}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/submissions/${deliverable.Id}`)
                        }}
                      >
                        <ApperIcon name="Eye" className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DeliverablesBoard