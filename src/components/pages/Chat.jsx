import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Textarea from "@/components/atoms/Textarea"
import ApperIcon from "@/components/ApperIcon"
import UserAvatar from "@/components/molecules/UserAvatar"
import SearchBar from "@/components/molecules/SearchBar"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import { userService } from "@/services/api/userService"

function Chat() {
const { studentId, responseId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  
  // State management
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [conversations, setConversations] = useState({})
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sending, setSending] = useState(false)
  const [attachments, setAttachments] = useState([])
  
  // AI Coach specific state
  const [aiCoachResponse, setAiCoachResponse] = useState(null)
  const [aiCoachData, setAiCoachData] = useState(null)
  const [isAiCoachMode, setIsAiCoachMode] = useState(false)
  const [isTakeoverMode, setIsTakeoverMode] = useState(false)
  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

// Detect AI Coach mode and takeover mode
  useEffect(() => {
    const isAiMode = !!responseId
    const isTakeover = searchParams.get('takeover') === 'true'
    setIsAiCoachMode(isAiMode)
    setIsTakeoverMode(isTakeover)
  }, [responseId, searchParams])

  // Load specific student chat
  useEffect(() => {
    if (studentId && students.length > 0) {
      const student = students.find(s => s.Id === parseInt(studentId))
      if (student) {
        setSelectedStudent(student)
        loadConversation(student.Id)
      }
    }
  }, [studentId, students])

  // Load AI Coach response data when in AI coach mode
  useEffect(() => {
    const loadAiCoachData = async () => {
      if (responseId && isAiCoachMode) {
        try {
          // Mock AI coach response data - in real app would fetch from API
          const mockAiResponse = {
            Id: parseInt(responseId),
            studentId: parseInt(studentId),
            aiCoachId: 1,
            studentQuestion: "I'm having trouble understanding React hooks. Can you explain useState and useEffect?",
            aiResponse: "Great question! React hooks are functions that let you use state and other React features in functional components. Let me break down useState and useEffect for you:\n\n**useState:**\n- Manages component state\n- Returns current state value and setter function\n- Example: const [count, setCount] = useState(0)\n\n**useEffect:**\n- Handles side effects (API calls, subscriptions, etc.)\n- Runs after render\n- Can specify dependencies to control when it runs\n- Example: useEffect(() => { /* side effect */ }, [dependency])\n\nWould you like me to show you some practical examples?",
            timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
            status: 'pending_review',
            conversationHistory: [
              {
                Id: 1,
                senderId: parseInt(studentId),
                senderName: students.find(s => s.Id === parseInt(studentId))?.name || "Student",
                senderRole: "student",
                content: "I'm having trouble understanding React hooks. Can you explain useState and useEffect?",
                timestamp: new Date(Date.now() - 15 * 60 * 1000),
                type: "text"
              },
              {
                Id: 2,
                senderId: 'ai-coach-1',
                senderName: "React Learning Assistant",
                senderRole: "ai_coach",
                content: "Great question! React hooks are functions that let you use state and other React features in functional components. Let me break down useState and useEffect for you:\n\n**useState:**\n- Manages component state\n- Returns current state value and setter function\n- Example: const [count, setCount] = useState(0)\n\n**useEffect:**\n- Handles side effects (API calls, subscriptions, etc.)\n- Runs after render\n- Can specify dependencies to control when it runs\n- Example: useEffect(() => { /* side effect */ }, [dependency])\n\nWould you like me to show you some practical examples?",
                timestamp: new Date(Date.now() - 10 * 60 * 1000),
                type: "text"
              }
            ]
          }
          
          setAiCoachResponse(mockAiResponse)
          
          // Load AI Coach data
          const mockAiCoach = {
            Id: 1,
            name: "React Learning Assistant",
            description: "Specialized AI coach for React development and best practices"
          }
          
          setAiCoachData(mockAiCoach)
          
          // Set the AI conversation in the conversations state
          if (mockAiResponse.conversationHistory) {
            setConversations(prev => ({
              ...prev,
              [parseInt(studentId)]: mockAiResponse.conversationHistory
            }))
          }
          
        } catch (err) {
          console.error("Failed to load AI coach data:", err)
          toast.error("Failed to load AI coach conversation")
        }
      }
    }
    
    if (students.length > 0) {
      loadAiCoachData()
    }
  }, [responseId, isAiCoachMode, studentId, students])
  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom()
  }, [conversations, selectedStudent])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const studentsData = await userService.getAll()
      const studentUsers = studentsData.filter(user => user.role === "student")
      setStudents(studentUsers)

      // Initialize conversations for all students
      const initialConversations = {}
      studentUsers.forEach(student => {
        initialConversations[student.Id] = generateSampleMessages(student)
      })
      setConversations(initialConversations)

    } catch (err) {
      console.error("Failed to load chat data:", err)
      setError(err.message || "Failed to load chat data")
      toast.error("Failed to load chat data")
    } finally {
      setLoading(false)
    }
  }

const loadConversation = (studentId) => {
    // In AI coach mode, conversation is loaded from AI response data
    if (isAiCoachMode && aiCoachResponse?.conversationHistory) {
      return // Already loaded in AI coach effect
    }
    
    // In a real app, this would fetch messages from API
    // For now, we use the generated sample messages
    const messages = conversations[studentId] || []
    setConversations(prev => ({
      ...prev,
      [studentId]: messages
    }))
  }

const generateSampleMessages = (student) => {
    // Don't generate sample messages in AI coach mode
    if (isAiCoachMode) {
      return []
    }
    
    const baseMessages = [
      {
        Id: 1,
        senderId: student.Id,
        senderName: student.name,
        senderRole: student.role,
        content: "Hi! I have a question about the recent assignment.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: "text"
      },
      {
        Id: 2,
        senderId: 1, // Assuming current user is coach/admin with ID 1
        senderName: "Coach Sarah",
        senderRole: "coach",
        content: "Of course! What can I help you with?",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        type: "text"
      },
      {
        Id: 3,
        senderId: student.Id,
        senderName: student.name,
        senderRole: student.role,
        content: "I'm having trouble understanding the React hooks concept. Could you provide some additional resources?",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        type: "text"
      }
    ]
    return baseMessages
  }

const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return
    if (!selectedStudent) return

    try {
      setSending(true)

      const messageData = {
        Id: Date.now(), // Simple ID generation for demo
        senderId: 1, // Current user ID
        senderName: "Coach Sarah",
        senderRole: "coach",
        content: newMessage.trim(),
        timestamp: new Date(),
        type: attachments.length > 0 ? "mixed" : "text",
        attachments: attachments.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file)
        }))
      }

      // Add message to conversation
      setConversations(prev => ({
        ...prev,
        [selectedStudent.Id]: [...(prev[selectedStudent.Id] || []), messageData]
      }))

      // Clear input
      setNewMessage("")
      setAttachments([])
      
      // Different behavior for AI coach mode
      if (isAiCoachMode && isTakeoverMode) {
        // In takeover mode, instructor message continues the conversation
        toast.success("Message sent - you've taken over this conversation!")
        // Don't simulate student response in takeover mode
      } else {
        // Normal chat mode - simulate response after a delay
        setTimeout(() => {
          const responseData = {
            Id: Date.now() + 1,
            senderId: selectedStudent.Id,
            senderName: selectedStudent.name,
            senderRole: selectedStudent.role,
            content: getAutomaticResponse(newMessage),
            timestamp: new Date(),
            type: "text"
          }

          setConversations(prev => ({
            ...prev,
            [selectedStudent.Id]: [...(prev[selectedStudent.Id] || []), responseData]
          }))
        }, 1500)
        
        toast.success("Message sent successfully!")
      }

    } catch (err) {
      console.error("Failed to send message:", err)
      toast.error("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const getAutomaticResponse = (message) => {
    const responses = [
      "Thank you for your message! I'll get back to you soon.",
      "Thanks for reaching out. Let me check on that for you.",
      "Got it! I'll review this and respond shortly.",
      "Thank you for the update. I'll take a look at this.",
      "Received your message. I'll address this in our next session."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleFileAttachment = (event) => {
    const files = Array.from(event.target.files)
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  const getLastMessage = (studentId) => {
    const messages = conversations[studentId] || []
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage) return "No messages yet"
    
    return lastMessage.content.length > 50 
      ? lastMessage.content.substring(0, 50) + "..."
      : lastMessage.content
  }

  const getLastMessageTime = (studentId) => {
    const messages = conversations[studentId] || []
    const lastMessage = messages[messages.length - 1]
    return lastMessage ? formatTime(lastMessage.timestamp) : ""
  }

  if (loading) return <Loading message="Loading conversations..." />
  if (error) return <Error message={error} onRetry={loadData} />

  return (
    <div className="h-[calc(100vh-2rem)] max-w-7xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Conversations List */}
        <div className={`lg:col-span-1 ${selectedStudent ? 'hidden lg:block' : 'block'}`}>
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ApperIcon name="Mail" className="h-5 w-5" />
                  Messages
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/students")}
                  className="lg:hidden"
                >
                  <ApperIcon name="Users" className="h-4 w-4" />
                </Button>
              </div>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search students..."
                className="mt-4"
              />
            </CardHeader>
            
            <CardContent className="flex-1 overflow-hidden">
              {filteredStudents.length === 0 ? (
                <Empty
                  icon="Users"
                  title="No students found"
                  description="No students match your search criteria."
                />
              ) : (
                <div className="space-y-2 overflow-y-auto custom-scrollbar h-full">
                  {filteredStudents.map((student) => (
                    <motion.div
                      key={student.Id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        onClick={() => {
                          setSelectedStudent(student)
                          navigate(`/chat/${student.Id}`)
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedStudent?.Id === student.Id
                            ? "bg-primary-50 border-primary-200 border"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <UserAvatar user={student} size="md" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm text-gray-900 truncate">
                                {student.name}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {getLastMessageTime(student.Id)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {getLastMessage(student.Id)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className={`lg:col-span-3 ${selectedStudent ? 'block' : 'hidden lg:block'}`}>
          {selectedStudent ? (
            <Card className="h-full flex flex-col">
              {/* Chat Header */}
              <CardHeader className="pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedStudent(null)
                        navigate("/chat")
                      }}
                      className="lg:hidden"
                    >
                      <ApperIcon name="ArrowLeft" className="h-4 w-4" />
                    </Button>
                    <UserAvatar user={selectedStudent} size="md" showName />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/students/${selectedStudent.Id}/progress`)}
                    >
                      <ApperIcon name="BarChart3" className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">Progress</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages Area */}
              <CardContent className="flex-1 overflow-hidden p-0">
                <div className="h-full flex flex-col">
{/* AI Coach Context Header */}
                  {isAiCoachMode && aiCoachData && (
                    <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-primary-100 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <ApperIcon name="Brain" className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-primary-900">
                              AI Coach Conversation
                            </h3>
                            <p className="text-xs text-primary-700">
                              {aiCoachData.name} • {isTakeoverMode ? "Taking over conversation" : "Reviewing AI responses"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isTakeoverMode && (
                            <div className="px-2 py-1 bg-warning-100 text-warning-700 text-xs font-medium rounded-full">
                              Instructor Takeover
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(-1)}
                            className="text-xs"
                          >
                            <ApperIcon name="ArrowLeft" className="h-3 w-3 mr-1" />
                            Back to Dashboard
                          </Button>
                        </div>
                      </div>
                      {aiCoachResponse && (
                        <div className="mt-3 p-3 bg-white/60 rounded-lg border border-primary-200">
                          <div className="text-xs text-primary-600 font-medium mb-1">Original Student Question:</div>
                          <div className="text-sm text-gray-700">{aiCoachResponse.studentQuestion}</div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                    {conversations[selectedStudent.Id]?.map((message) => (
                      <motion.div
                        key={message.Id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.senderId === 1 ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg ${
                          message.senderId === 1 ? 'order-2' : 'order-1'
                        }`}>
                          <div className={`p-3 rounded-lg ${
                            message.senderId === 1
                              ? 'bg-primary-500 text-white ml-auto'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium opacity-75">
                                {message.senderName}
                              </span>
                              <span className={`text-xs opacity-75 ${
                                message.senderId === 1 ? 'text-primary-100' : 'text-gray-500'
                              }`}>
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.attachments.map((attachment, index) => (
                                  <div
                                    key={index}
                                    className={`flex items-center gap-2 p-2 rounded text-xs ${
                                      message.senderId === 1
                                        ? 'bg-primary-400'
                                        : 'bg-gray-200'
                                    }`}
                                  >
                                    <ApperIcon name="Paperclip" className="h-3 w-3" />
                                    <span className="truncate">{attachment.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    {/* Attachments Preview */}
                    {attachments.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-gray-100 rounded-lg p-2 text-sm"
                          >
                            <ApperIcon name="Paperclip" className="h-4 w-4" />
                            <span className="truncate max-w-32">{file.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                              className="h-6 w-6 p-0 hover:bg-gray-200"
                            >
                              <ApperIcon name="X" className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Input Area */}
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type your message..."
                          rows={1}
                          className="resize-none min-h-[40px] max-h-32"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          onChange={handleFileAttachment}
                          className="hidden"
                        />
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-10 w-10 p-0"
                        >
                          <ApperIcon name="Paperclip" className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          onClick={handleSendMessage}
                          disabled={(!newMessage.trim() && attachments.length === 0) || sending}
                          loading={sending}
                          size="sm"
                          className="h-10 px-4"
                        >
                          <ApperIcon name="Send" className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <ApperIcon name="MessageSquare" className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a student from the list to start messaging
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default Chat