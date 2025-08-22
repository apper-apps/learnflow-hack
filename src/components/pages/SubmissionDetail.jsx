import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Textarea from "@/components/atoms/Textarea"
import ApperIcon from "@/components/ApperIcon"
import StatusBadge from "@/components/molecules/StatusBadge"
import UserAvatar from "@/components/molecules/UserAvatar"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import { submissionService, commentService } from "@/services/api/submissionService"
import { userService } from "@/services/api/userService"
import { lessonService } from "@/services/api/courseService"

const SubmissionDetail = () => {
  const { submissionId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [submission, setSubmission] = useState(null)
  const [student, setStudent] = useState(null)
  const [lesson, setLesson] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [updating, setUpdating] = useState(false)

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

      const [submissionData, commentsData] = await Promise.all([
        submissionService.getById(submissionId),
        commentService.getBySubmissionId(submissionId)
      ])

      setSubmission(submissionData)
      setComments(commentsData)

      // Load related data
      const [studentData, lessonData] = await Promise.all([
        userService.getById(submissionData.studentId),
        lessonService.getById(submissionData.lessonId)
      ])

      setStudent(studentData)
      setLesson(lessonData)

    } catch (err) {
      console.error("Failed to load submission:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      setSubmitting(true)

      const comment = await commentService.create({
        submissionId: parseInt(submissionId),
        authorId: currentUser.Id,
        text: newComment
      })

      setComments([...comments, comment])
      setNewComment("")
      toast.success("Comment added successfully!")

    } catch (err) {
      toast.error("Failed to add comment: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateSubmissionStatus = async (newStatus) => {
    try {
      setUpdating(true)

      await submissionService.update(submissionId, { status: newStatus })
      setSubmission({ ...submission, status: newStatus })
      
      const statusMessages = {
        approved: "Submission approved successfully!",
        changes_requested: "Changes requested. Student has been notified.",
        pending: "Submission status updated to pending."
      }

      toast.success(statusMessages[newStatus] || "Status updated successfully!")

    } catch (err) {
      toast.error("Failed to update status: " + err.message)
    } finally {
      setUpdating(false)
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

  const getFileIcon = (type) => {
    if (type?.includes("image")) return "Image"
    if (type?.includes("pdf")) return "FileText"
    if (type?.includes("video")) return "Video"
    return "File"
  }

  useEffect(() => {
    loadData()
  }, [submissionId])

  if (loading) return <Loading type="skeleton" />
  if (error) return <Error message={error} onRetry={loadData} />
  if (!submission) return <Error message="Submission not found" showRetry={false} />

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/reviews")}>
            <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
            Back to Inbox
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Submission Review
            </h1>
            <p className="text-gray-600">
              {lesson?.title} • {student?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={submission.status} type="submission" />
          <div className="text-sm text-gray-500">
            Submitted {formatTimeAgo(submission.submittedAt)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Submission Content */}
        <div className="space-y-6">
          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <UserAvatar user={student} size="lg" showName />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mt-1">
                    Submitted on {new Date(submission.submittedAt).toLocaleDateString()} at{" "}
                    {new Date(submission.submittedAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lesson Info */}
          <Card>
            <CardHeader>
              <CardTitle>Lesson Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">{lesson?.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {lesson?.content}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <ApperIcon name="Clock" className="h-4 w-4" />
                  <span>Lesson {submission.lessonId}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Content */}
          <Card>
            <CardHeader>
              <CardTitle>Student Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {submission.content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Attachments */}
          {submission.files && submission.files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>File Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {submission.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-accent-500 rounded-lg flex items-center justify-center">
                          <ApperIcon 
                            name={getFileIcon(file.type)} 
                            className="h-5 w-5 text-white" 
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{file.name}</h4>
                          <p className="text-sm text-gray-500">
                            {file.type || "Unknown type"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(file.url, "_blank")}
                      >
                        <ApperIcon name="Download" className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-3">
                <Button
                  variant="success"
                  className="flex-1"
                  onClick={() => handleUpdateSubmissionStatus("approved")}
                  disabled={updating || submission.status === "approved"}
                >
                  <ApperIcon name="CheckCircle" className="h-4 w-4 mr-2" />
                  Approve Submission
                </Button>
                <Button
                  variant="warning"
                  className="flex-1"
                  onClick={() => handleUpdateSubmissionStatus("changes_requested")}
                  disabled={updating || submission.status === "changes_requested"}
                >
                  <ApperIcon name="AlertCircle" className="h-4 w-4 mr-2" />
                  Request Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Comments */}
        <div className="space-y-6">
          <Card className="h-[calc(100vh-200px)] flex flex-col">
            <CardHeader>
              <CardTitle>Comments & Feedback</CardTitle>
            </CardHeader>
            
            {/* Comments List */}
            <CardContent className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ApperIcon name="MessageSquare" className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No comments yet. Start the conversation!</p>
                  </div>
                ) : (
                  comments.map((comment, index) => {
                    const isCurrentUser = comment.authorId === currentUser.Id
                    const author = isCurrentUser ? currentUser : student

                    return (
                      <motion.div
                        key={comment.Id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex gap-3 ${isCurrentUser ? "flex-row-reverse" : ""}`}
                      >
                        <UserAvatar user={author} size="sm" />
                        <div className={`flex-1 max-w-xs ${isCurrentUser ? "text-right" : ""}`}>
                          <div className={`inline-block p-3 rounded-lg ${
                            isCurrentUser 
                              ? "bg-primary-600 text-white" 
                              : "bg-gray-100 text-gray-900"
                          }`}>
                            <p className="text-sm">{comment.text}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {author.name} • {formatTimeAgo(comment.createdAt)}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </CardContent>

            {/* Comment Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-3">
                <UserAvatar user={currentUser} size="sm" />
                <div className="flex-1 space-y-3">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment or feedback..."
                    rows={2}
                    className="resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || submitting}
                      loading={submitting}
                    >
                      <ApperIcon name="Send" className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SubmissionDetail