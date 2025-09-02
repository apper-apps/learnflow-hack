import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import { submissionService } from "@/services/api/submissionService";
import { userService } from "@/services/api/userService";
import { lessonService } from "@/services/api/courseService";
import ApperIcon from "@/components/ApperIcon";
import UserAvatar from "@/components/molecules/UserAvatar";
import SearchBar from "@/components/molecules/SearchBar";
import StatusBadge from "@/components/molecules/StatusBadge";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Dashboard from "@/components/pages/Dashboard";
import Button from "@/components/atoms/Button";
const DeliverablesBoard = () => {
const [deliverables, setDeliverables] = useState([])
  const [filteredDeliverables, setFilteredDeliverables] = useState([])
  const [students, setStudents] = useState([])
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("approved")
  const [viewMode, setViewMode] = useState("kanban") // Default to Kanban view
  const [updating, setUpdating] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  // Mock current user - in real app this would come from auth context
  const currentUser = {
    Id: 2,
    name: "Michael Chen",
    role: "coach"
  }

  // Kanban columns configuration
  const kanbanColumns = [
    { 
      id: "pending", 
      title: "Submissions", 
      status: "pending",
      color: "bg-blue-50 border-blue-200",
      headerColor: "text-blue-700",
      icon: "Send"
    },
    { 
      id: "review", 
      title: "Awaiting Review", 
      status: "pending",
      color: "bg-yellow-50 border-yellow-200", 
      headerColor: "text-yellow-700",
      icon: "Clock"
    },
    { 
      id: "changes", 
      title: "Needs Changes", 
      status: "changes_requested",
      color: "bg-red-50 border-red-200",
      headerColor: "text-red-700", 
      icon: "AlertCircle"
    },
    { 
      id: "approved", 
      title: "Approved", 
      status: "approved",
      color: "bg-green-50 border-green-200",
      headerColor: "text-green-700",
      icon: "CheckCircle"
    }
  ]

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
      setFilteredDeliverables(deliverableData)
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

    // For list view, filter by tab/status
    if (viewMode === "list") {
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

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result

    // No destination (dropped outside)
    if (!destination) return

    // No change in position
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const deliverableId = parseInt(draggableId)
    const newStatus = getStatusFromColumnId(destination.droppableId)

    try {
      setUpdating(true)

      // Update the deliverable status in the service
      await submissionService.update(deliverableId, { status: newStatus })

      // Update local state
      setDeliverables(prevDeliverables => 
        prevDeliverables.map(d => 
          d.Id === deliverableId 
            ? { ...d, status: newStatus, approvedAt: newStatus === "approved" ? new Date().toISOString() : d.approvedAt }
            : d
        )
      )

      // Update filtered deliverables
      setFilteredDeliverables(prevFiltered => 
        prevFiltered.map(d => 
          d.Id === deliverableId 
            ? { ...d, status: newStatus, approvedAt: newStatus === "approved" ? new Date().toISOString() : d.approvedAt }
            : d
        )
      )

      const statusMessages = {
        pending: "Moved to submissions queue",
        changes_requested: "Marked as needing changes",
        approved: "Deliverable approved!"
      }

      toast.success(statusMessages[newStatus] || "Status updated successfully!")

    } catch (err) {
      console.error("Failed to update deliverable status:", err)
      toast.error("Failed to update status: " + err.message)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusFromColumnId = (columnId) => {
    switch (columnId) {
      case "pending":
      case "review":
        return "pending"
      case "changes":
        return "changes_requested"
      case "approved":
        return "approved"
      default:
        return "pending"
    }
  }

  const getDeliverablesForColumn = (columnId) => {
    const columnStatus = getStatusFromColumnId(columnId)
    return filteredDeliverables.filter(d => {
      if (columnId === "pending") {
        return d.status === "pending" && !isInReview(d)
      } else if (columnId === "review") {
        return d.status === "pending" && isInReview(d)
      } else {
        return d.status === columnStatus
      }
    })
  }

  const isInReview = (deliverable) => {
    // Logic to determine if a deliverable is actively being reviewed
    // For demo purposes, we'll consider recent pending submissions as "in review"
    const now = new Date()
    const submittedAt = new Date(deliverable.submittedAt)
    const hoursDiff = (now - submittedAt) / (1000 * 60 * 60)
    return hoursDiff < 24 && deliverable.status === "pending"
  }

const getStudentName = (studentId) => {
    const student = students.find(s => s.Id === studentId)
    return student?.name || "Unknown Student"
  }

  const getStudent = (studentId) => {
    return students.find(s => s.Id === studentId) || { name: "Unknown Student", role: "student" }
  }

  const getLessonTitle = (lessonId) => {
    const lesson = lessons.find(l => l.Id === lessonId)
    return lesson?.title || `Lesson ${lessonId}`
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

// Detect if we should show Kanban view based on route
  useEffect(() => {
    if (location.pathname.includes('/kanban')) {
      setViewMode("kanban")
    }
  }, [location.pathname])
useEffect(() => {
    filterDeliverables(searchQuery, activeTab)
  }, [deliverables, searchQuery, activeTab, viewMode])

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
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                viewMode === "list"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ApperIcon name="List" className="h-4 w-4" />
              List View
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                viewMode === "kanban"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ApperIcon name="Kanban" className="h-4 w-4" />
              Kanban Board
            </button>
          </div>

          {(currentUser.role === "admin" || currentUser.role === "coach") && (
            <Button onClick={() => navigate("/reviews")}>
              <ApperIcon name="MessageSquare" className="h-4 w-4 mr-2" />
              Review Submissions
            </Button>
          )}
        </div>
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

      {/* Search and View Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar
            placeholder="Search deliverables..."
            onSearch={handleSearch}
          />
        </div>
        
        {/* Status Tabs - Only show in List View */}
        {viewMode === "list" && (
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
        )}
      </div>

{/* Main Content - Toggle between List and Kanban Views */}
      <AnimatePresence mode="wait">
        {viewMode === "kanban" ? (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Kanban Board */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kanbanColumns.map((column) => {
                  const columnDeliverables = getDeliverablesForColumn(column.id)
                  
                  return (
                    <div key={column.id} className={`${column.color} rounded-xl border-2 min-h-[600px]`}>
                      {/* Column Header */}
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                              <ApperIcon name={column.icon} className={`h-4 w-4 ${column.headerColor}`} />
                            </div>
                            <div>
                              <h3 className={`font-semibold ${column.headerColor}`}>
                                {column.title}
                              </h3>
                              <p className="text-sm text-gray-500">{columnDeliverables.length} items</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Droppable Column Content */}
                      <Droppable droppableId={column.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`p-4 space-y-3 min-h-[500px] transition-colors ${
                              snapshot.isDraggingOver ? 'bg-white/50' : ''
                            }`}
                          >
                            {columnDeliverables.length === 0 && !snapshot.isDraggingOver ? (
                              <div className="text-center py-8 text-gray-400">
                                <ApperIcon name="Plus" className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No items yet</p>
                              </div>
                            ) : (
                              columnDeliverables.map((deliverable, index) => {
                                const student = getStudent(deliverable.studentId)
                                
                                return (
                                  <Draggable 
                                    key={deliverable.Id} 
                                    draggableId={deliverable.Id.toString()} 
                                    index={index}
                                    isDragDisabled={updating}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`transform transition-all duration-200 ${
                                          snapshot.isDragging 
                                            ? 'rotate-3 scale-105 shadow-xl z-50' 
                                            : 'hover:shadow-md'
                                        }`}
                                      >
                                        <Card className={`bg-white cursor-grab active:cursor-grabbing ${
                                          snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary-200' : ''
                                        }`}>
                                          <CardContent className="p-4 space-y-3">
                                            {/* Header with Status and ID */}
                                            <div className="flex items-start justify-between">
                                              <StatusBadge status={deliverable.status} type="submission" />
                                              <span className="text-xs font-mono text-gray-400">
                                                {deliverable.deliverableId}
                                              </span>
                                            </div>

                                            {/* Lesson Title */}
                                            <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                                              {getLessonTitle(deliverable.lessonId)}
                                            </h4>

                                            {/* Student Info */}
                                            <div className="flex items-center gap-2">
                                              <UserAvatar user={student} size="sm" />
                                              <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-gray-900 truncate">
                                                  {student?.name}
                                                </p>
                                                <p className="text-xs text-gray-500">Student</p>
                                              </div>
                                            </div>

                                            {/* Response Preview */}
                                            <div className="space-y-1">
                                              <p className="text-xs font-medium text-gray-600">Response:</p>
                                              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                                {deliverable.content}
                                              </p>
                                            </div>

                                            {/* Files Indicator */}
                                            {deliverable.files && deliverable.files.length > 0 && (
                                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <ApperIcon name="Paperclip" className="h-3 w-3" />
                                                <span>{deliverable.files.length} 📎</span>
                                              </div>
                                            )}

                                            {/* Timestamps */}
                                            <div className="text-xs text-gray-400">
                                              <p>Submitted {formatTimeAgo(deliverable.submittedAt)}</p>
                                              {deliverable.status === "approved" && deliverable.approvedAt && (
                                                <p>Approved {formatTimeAgo(deliverable.approvedAt)}</p>
                                              )}
                                            </div>

                                            {/* View Details Button */}
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="w-full text-xs py-1"
                                              onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                navigate(`/submissions/${deliverable.Id}`)
                                              }}
                                            >
                                              <ApperIcon name="Eye" className="h-3 w-3 mr-1" />
                                              View Details
                                            </Button>
                                          </CardContent>
                                        </Card>
                                      </div>
                                    )}
                                  </Draggable>
                                )
                              })
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )
                })}
              </div>
            </DragDropContext>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* List View - Original Grid */}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DeliverablesBoard