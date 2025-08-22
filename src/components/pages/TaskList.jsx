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
import { taskService, submissionService } from "@/services/api/submissionService"
import { userService } from "@/services/api/userService"
import { lessonService } from "@/services/api/courseService"

const TaskList = () => {
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [students, setStudents] = useState([])
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("pending")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const navigate = useNavigate()

  // Mock current user - in real app this would come from auth context
  const currentUser = {
    Id: 2,
    name: "Michael Chen",
    role: "coach"
  }

  const loadData = async () => {
    try {
      setError("")
      setLoading(true)

      const [tasksData, submissionsData, studentsData, lessonsData] = await Promise.all([
        taskService.getByCoachId(currentUser.Id),
        submissionService.getAll(),
        userService.getByRole("student"),
        lessonService.getAll()
      ])

      // Enrich tasks with submission data
      const enrichedTasks = tasksData.map(task => {
        const submission = submissionsData.find(s => s.Id === task.submissionId)
        return { ...task, submission }
      }).sort((a, b) => {
        // Sort by priority and due date
        if (a.priority === "high" && b.priority !== "high") return -1
        if (b.priority === "high" && a.priority !== "high") return 1
        return new Date(a.dueDate) - new Date(b.dueDate)
      })

      setTasks(enrichedTasks)
      setFilteredTasks(enrichedTasks.filter(t => t.status === "pending"))
      setSubmissions(submissionsData)
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
    filterTasks(query, statusFilter, priorityFilter)
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    filterTasks(searchQuery, status, priorityFilter)
  }

  const handlePriorityFilter = (priority) => {
    setPriorityFilter(priority)
    filterTasks(searchQuery, statusFilter, priority)
  }

  const filterTasks = (query, status, priority) => {
    let filtered = [...tasks]

    // Filter by status
    if (status !== "all") {
      filtered = filtered.filter(task => task.status === status)
    }

    // Filter by priority
    if (priority !== "all") {
      filtered = filtered.filter(task => task.priority === priority)
    }

    // Filter by search query
    if (query) {
      filtered = filtered.filter(task => {
        const student = getStudentName(task.submission?.studentId).toLowerCase()
        const lesson = getLessonTitle(task.submission?.lessonId).toLowerCase()
        const content = task.submission?.content?.toLowerCase() || ""
        return student.includes(query.toLowerCase()) || 
               lesson.includes(query.toLowerCase()) || 
               content.includes(query.toLowerCase())
      })
    }

    setFilteredTasks(filtered)
  }

  const handleCompleteTask = async (taskId) => {
    try {
      await taskService.update(taskId, { status: "completed" })
      setTasks(tasks.map(task => 
        task.Id === taskId ? { ...task, status: "completed" } : task
      ))
      toast.success("Task marked as completed!")
      filterTasks(searchQuery, statusFilter, priorityFilter)
    } catch (err) {
      toast.error("Failed to update task: " + err.message)
    }
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

  const getTaskPriorityColor = (priority, isOverdue) => {
    if (isOverdue) return "text-error-600"
    switch (priority) {
      case "high": return "text-error-600"
      case "medium": return "text-warning-600"
      case "low": return "text-gray-600"
      default: return "text-gray-600"
    }
  }

  const getTaskPriorityIcon = (priority, isOverdue) => {
    if (isOverdue) return "AlertTriangle"
    switch (priority) {
      case "high": return "AlertTriangle"
      case "medium": return "Clock"
      case "low": return "Minus"
      default: return "Clock"
    }
  }

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date()
  }

  const formatDueDate = (dueDate) => {
    const date = new Date(dueDate)
    const now = new Date()
    const diffInHours = Math.floor((date - now) / (1000 * 60 * 60))
    
    if (diffInHours < 0) return "Overdue"
    if (diffInHours < 24) return `${diffInHours}h remaining`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d remaining`
  }

  const getStatusCounts = () => {
    return {
      pending: tasks.filter(t => t.status === "pending").length,
      completed: tasks.filter(t => t.status === "completed").length,
      overdue: tasks.filter(t => t.status === "pending" && isOverdue(t.dueDate)).length
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterTasks(searchQuery, statusFilter, priorityFilter)
  }, [tasks])

  if (loading) return <Loading type="skeleton" />
  if (error) return <Error message={error} onRetry={loadData} />

  const statusCounts = getStatusCounts()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Review Tasks
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your submission review assignments and deadlines
          </p>
        </div>
        
        <Button onClick={() => navigate("/reviews")}>
          <ApperIcon name="MessageSquare" className="h-4 w-4 mr-2" />
          Go to Review Inbox
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning-600">{statusCounts.pending}</div>
            <div className="text-sm text-gray-600">Pending Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success-600">{statusCounts.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-error-600">{statusCounts.overdue}</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">{tasks.length}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar
            placeholder="Search tasks..."
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
            <option value="completed">Completed</option>
          </Select>
          
          <Select
            value={priorityFilter}
            onChange={(e) => handlePriorityFilter(e.target.value)}
            className="w-40"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Empty
          icon="CheckSquare"
          title="No tasks found"
          message={searchQuery || statusFilter !== "pending" || priorityFilter !== "all"
            ? "No tasks match your current filters. Try adjusting your search or filter criteria."
            : "No review tasks assigned to you at the moment. New tasks will appear here when students submit their homework."
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
                    <th className="text-left p-4 font-medium text-gray-900">Task</th>
                    <th className="text-left p-4 font-medium text-gray-900">Student</th>
                    <th className="text-left p-4 font-medium text-gray-900">Lesson</th>
                    <th className="text-left p-4 font-medium text-gray-900">Priority</th>
                    <th className="text-left p-4 font-medium text-gray-900">Due Date</th>
                    <th className="text-left p-4 font-medium text-gray-900">Status</th>
                    <th className="text-right p-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTasks.map((task, index) => {
                    const student = getStudent(task.submission?.studentId)
                    const taskIsOverdue = isOverdue(task.dueDate)
                    
                    return (
                      <motion.tr
                        key={task.Id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`hover:bg-gray-50 ${taskIsOverdue ? "bg-error-50" : ""}`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                              task.status === "completed" ? "bg-success-100" : "bg-warning-100"
                            }`}>
                              <ApperIcon 
                                name={task.status === "completed" ? "CheckCircle" : "Clock"} 
                                className={`h-5 w-5 ${
                                  task.status === "completed" ? "text-success-600" : "text-warning-600"
                                }`}
                              />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                Review Submission
                              </div>
                              <div className="text-sm text-gray-500">
                                Task #{task.Id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <UserAvatar user={student} size="sm" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {getStudentName(task.submission?.studentId)}
                              </div>
                              <div className="text-sm text-gray-500">Student</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">
                            {getLessonTitle(task.submission?.lessonId)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Lesson {task.submission?.lessonId}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className={`flex items-center gap-1 text-sm font-medium ${
                            getTaskPriorityColor(task.priority, taskIsOverdue)
                          }`}>
                            <ApperIcon 
                              name={getTaskPriorityIcon(task.priority, taskIsOverdue)} 
                              className="h-4 w-4" 
                            />
                            {taskIsOverdue ? "Overdue" : task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className={`text-sm ${taskIsOverdue ? "text-error-600 font-medium" : "text-gray-900"}`}>
                            {formatDueDate(task.dueDate)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <StatusBadge 
                            status={task.status === "completed" ? "completed" : taskIsOverdue ? "overdue" : "pending"} 
                            type="task" 
                          />
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/submissions/${task.submission?.Id}`)}
                            >
                              <ApperIcon name="Eye" className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                            {task.status === "pending" && (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleCompleteTask(task.Id)}
                              >
                                <ApperIcon name="Check" className="h-4 w-4 mr-2" />
                                Complete
                              </Button>
                            )}
                          </div>
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

export default TaskList