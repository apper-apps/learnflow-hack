import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Textarea from "@/components/atoms/Textarea"
import ApperIcon from "@/components/ApperIcon"
import ProgressRing from "@/components/molecules/ProgressRing"
import StatusBadge from "@/components/molecules/StatusBadge"
import SearchBar from "@/components/molecules/SearchBar"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import { courseService } from "@/services/api/courseService"
import { submissionService } from "@/services/api/submissionService"
import { enrollmentService } from "@/services/api/enrollmentService"
import { searchService } from "@/services/api/searchService"
const CoursePlayer = () => {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()

const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [courseData, setCourseData] = useState(null)
  const [currentLesson, setCurrentLesson] = useState(null)
  const [activeTab, setActiveTab] = useState("content")
  const [submissionText, setSubmissionText] = useState("")
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [highlightedChunk, setHighlightedChunk] = useState(null)
  const videoRef = useRef(null)
  // Mock current user - in real app this would come from auth context
  const currentUser = {
    Id: 4,
    name: "David Thompson",
    role: "student"
  }

  const loadCourseData = async () => {
    try {
      setError("")
      setLoading(true)

      const courseStructure = await courseService.getCourseStructure(courseId)
      setCourseData(courseStructure)

      // Find current lesson
      let foundLesson = null
      if (lessonId) {
        for (const module of courseStructure.modules) {
          foundLesson = module.lessons.find(l => l.Id === parseInt(lessonId))
          if (foundLesson) break
        }
      } else {
        // Default to first lesson
        if (courseStructure.modules[0]?.lessons[0]) {
          foundLesson = courseStructure.modules[0].lessons[0]
          navigate(`/courses/${courseId}/play/${foundLesson.Id}`, { replace: true })
        }
      }

if (foundLesson) {
        setCurrentLesson(foundLesson)
        // Initialize transcript chunks for search if available
        if (foundLesson.transcriptChunks) {
          setSearchResults([])
        }
      }

    } catch (err) {
      console.error("Failed to load course:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

const handleLessonSelect = (lesson) => {
    setCurrentLesson(lesson)
    navigate(`/courses/${courseId}/play/${lesson.Id}`)
    setSubmissionText("")
    setFiles([])
    setActiveTab("content")
    setSearchResults([])
    setHighlightedChunk(null)
  }

  const handleSeekToTime = async (seconds) => {
    if (videoRef.current) {
      try {
        // For iframe videos, we'll simulate the seek functionality
        // In a real implementation, you'd use the video player's API
        videoRef.current.contentWindow?.postMessage({
          action: 'seekTo',
          time: seconds
        }, '*')
        
        toast.success(`Seeking to ${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`)
      } catch (error) {
        toast.error("Unable to seek video at this time")
      }
    }
  }

  const handleTranscriptSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      const results = await searchService.searchTranscripts(query, {
        courseId: courseId,
        lessonId: lessonId
      })
      setSearchResults(results)
    } catch (error) {
      toast.error("Search failed. Please try again.")
      setSearchResults([])
    }
    setSearchLoading(false)
  }

  const handleSearchResultClick = (result) => {
    handleSeekToTime(result.startSeconds)
    setHighlightedChunk(result.chunkId)
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      setHighlightedChunk(null)
    }, 3000)
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    const fileData = selectedFiles.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file), // In real app, upload to server
      type: file.type
    }))
    setFiles([...files, ...fileData])
  }

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmitHomework = async () => {
    try {
      if (!submissionText.trim() && files.length === 0) {
        toast.error("Please provide either text content or file attachments")
        return
      }

      setSubmitting(true)

      await submissionService.create({
        lessonId: currentLesson.Id,
        studentId: currentUser.Id,
        content: submissionText,
        files: files
      })

      toast.success("Homework submitted successfully!")
      setSubmissionText("")
      setFiles([])

    } catch (err) {
      toast.error("Failed to submit homework: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

useEffect(() => {
    loadCourseData()
  }, [courseId, lessonId])

  useEffect(() => {
    // Listen for video player ready events
    const handleMessage = (event) => {
      if (event.data.action === 'playerReady') {
        // Video player is ready for seek operations
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  if (loading) return <Loading type="skeleton" />
  if (error) return <Error message={error} onRetry={loadCourseData} />

  if (!courseData || !currentLesson) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-8">
            <ApperIcon name="AlertTriangle" className="h-12 w-12 text-warning-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No lesson found</h3>
            <p className="text-gray-500">Please select a lesson from the course outline.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getTotalLessons = () => {
    return courseData.modules.reduce((total, module) => total + (module.lessons?.length || 0), 0)
  }

  const getCurrentLessonIndex = () => {
    let index = 0
    for (const module of courseData.modules) {
      for (const lesson of module.lessons || []) {
        if (lesson.Id === currentLesson.Id) return index
        index++
      }
    }
    return 0
  }

  const progress = Math.round(((getCurrentLessonIndex() + 1) / getTotalLessons()) * 100)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Course Outline */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Course Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/courses")}
            >
              <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
              Back
            </Button>
            <ProgressRing progress={progress} size={48} strokeWidth={4} />
          </div>
          
          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            {courseData.title}
          </h1>
          <p className="text-sm text-gray-500">
            {getCurrentLessonIndex() + 1} of {getTotalLessons()} lessons
          </p>
        </div>

        {/* Module/Lesson List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-4">
            {courseData.modules.map((module, moduleIndex) => (
              <div key={module.Id} className="space-y-2">
                <div className="flex items-center gap-3 px-2 py-1">
                  <div className="h-6 w-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-md flex items-center justify-center text-white text-xs font-medium">
                    {moduleIndex + 1}
                  </div>
                  <h3 className="font-medium text-gray-900">{module.title}</h3>
                </div>

                <div className="ml-9 space-y-1">
                  {module.lessons?.map((lesson, lessonIndex) => (
                    <button
                      key={lesson.Id}
                      onClick={() => handleLessonSelect(lesson)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        currentLesson.Id === lesson.Id
                          ? "bg-primary-100 text-primary-800 border border-primary-200"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{lesson.title}</span>
                        {lesson.requiresSubmission && (
                          <ApperIcon name="FileText" className="h-4 w-4 text-warning-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
{/* Lesson Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentLesson.title}</h1>
              <div className="flex items-center gap-4 mt-2">
                <StatusBadge status={currentLesson.status} type="lesson" />
                {currentLesson.requiresSubmission && (
                  <div className="flex items-center gap-1 text-sm text-warning-600">
                    <ApperIcon name="FileText" className="h-4 w-4" />
                    Homework Required
                  </div>
                )}
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="w-80">
              <SearchBar
                placeholder="Search this lesson's transcript..."
                onSearch={handleTranscriptSearch}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6">
            {/* Video Player */}
{currentLesson.videoUrl && (
              <Card className="mb-6">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gray-900 rounded-t-lg overflow-hidden">
                    <iframe
                      ref={videoRef}
                      src={currentLesson.videoUrl}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </CardContent>
              </Card>
            )}
{/* Tabbed Navigation */}
            <div className="mb-6">
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                {["content", "resources", "faq"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === tab
                        ? "bg-white text-primary-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
                {currentLesson.requiresSubmission && (
                  <button
                    onClick={() => setActiveTab("homework")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === "homework"
                        ? "bg-white text-primary-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Homework
                  </button>
                )}
              </div>
            </div>

            {/* Tab Content */}
            <Card>
              <CardContent className="p-6">
                {activeTab === "content" && (
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {currentLesson.content}
                    </div>
                  </div>
                )}


{activeTab === "content" && (
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {currentLesson.content}
                    </div>
                  </div>
                )}

                {activeTab === "resources" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Resources</h3>
                    {currentLesson.resources?.length > 0 ? (
                      <div className="grid gap-3">
                        {currentLesson.resources.map((resource, index) => (
                          <a
                            key={index}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
                          >
                            <div className="h-10 w-10 bg-accent-500 rounded-lg flex items-center justify-center">
                              <ApperIcon 
                                name={resource.type === "pdf" ? "FileText" : "ExternalLink"} 
                                className="h-5 w-5 text-white" 
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{resource.title}</h4>
                              <p className="text-sm text-gray-500 capitalize">{resource.type}</p>
                            </div>
                            <ApperIcon name="ExternalLink" className="h-4 w-4 text-gray-400 ml-auto" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No additional resources for this lesson.</p>
                    )}
                  </div>
                )}

                {activeTab === "faq" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
                    {currentLesson.faq?.length > 0 ? (
                      <div className="space-y-4">
                        {currentLesson.faq.map((item, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">{item.question}</h4>
                            <p className="text-gray-700">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No FAQ items for this lesson.</p>
                    )}
                  </div>
                )}

                {activeTab === "homework" && currentLesson.requiresSubmission && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Submit Your Homework</h3>
                    
                    <Textarea
                      label="Your Response"
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      placeholder="Share your thoughts, solutions, or answers to the lesson content..."
                      rows={6}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        File Attachments (Optional)
                      </label>
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <ApperIcon name="Upload" className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">Click to upload files</span>
                        </label>
                      </div>

                      {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <ApperIcon name="File" className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium">{file.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                              >
                                <ApperIcon name="X" className="h-4 w-4 text-error-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleSubmitHomework}
                      loading={submitting}
                      disabled={!submissionText.trim() && files.length === 0}
                      className="w-full"
                    >
                      <ApperIcon name="Send" className="h-4 w-4 mr-2" />
                      Submit Homework
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoursePlayer