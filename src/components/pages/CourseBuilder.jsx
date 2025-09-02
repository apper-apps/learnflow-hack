import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Textarea from "@/components/atoms/Textarea"
import Select from "@/components/atoms/Select"
import ApperIcon from "@/components/ApperIcon"
import StatusBadge from "@/components/molecules/StatusBadge"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import { courseService, moduleService, lessonService } from "@/services/api/courseService"

const CourseBuilder = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const isEditing = !!courseId

const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [draftStatus, setDraftStatus] = useState("")
  const [autoSaveTimer, setAutoSaveTimer] = useState(null)
const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    status: "draft",
    pricing: {
type: "free", // free, one_time, subscription, monthly_plan
      daysUntilExpiry: null,
      price: null,
      monthlyPrice: null,
      currency: "USD"
    },
    dripSchedule: {
      enabled: false,
      type: "enrollment", // enrollment, start_date, specific_date
      specificDate: null,
      lessons: {} // lessonId: { daysAfter: number }
    }
  })
  const [modules, setModules] = useState([])
  const [selectedModule, setSelectedModule] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [showLessonBuilder, setShowLessonBuilder] = useState(false)
  const [lessonFormStep, setLessonFormStep] = useState(1)
  const [lessonFormData, setLessonFormData] = useState({
    title: "",
    content: "",
    videoUrl: "",
    resources: [],
    faq: [],
    requiresSubmission: false
  })

  const loadCourseData = async () => {
    if (!isEditing) return

    try {
      setLoading(true)
      setError("")

      const courseStructure = await courseService.getCourseStructure(courseId)
setCourseData({
        title: courseStructure.title,
        description: courseStructure.description,
        status: courseStructure.status,
pricing: courseStructure.pricing || {
          type: "free",
          daysUntilExpiry: null,
          price: null,
          monthlyPrice: null,
          currency: "USD"
        },
        dripSchedule: courseStructure.dripSchedule || {
          enabled: false,
          type: "enrollment",
          specificDate: null,
          lessons: {}
        }
      })
      setModules(courseStructure.modules || [])

    } catch (err) {
      console.error("Failed to load course:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

const handleSaveCourse = async (isDraft = false) => {
    try {
      if (!isDraft && !courseData.title.trim()) {
        toast.error("Please enter a course title")
        return
      }

      let savedCourse
      if (isEditing) {
savedCourse = await courseService.update(courseId, courseData)
        if (isDraft) {
          setDraftStatus(`Draft saved at ${new Date().toLocaleTimeString()}`)
        } else {
          toast.success("Course published successfully!")
        }
      } else {
savedCourse = await courseService.create({
          ...courseData,
          ownerId: 2 // Default coach ID for demo
        })
        if (isDraft) {
          setDraftStatus(`Draft saved at ${new Date().toLocaleTimeString()}`)
          navigate(`/courses/${savedCourse.Id}/edit`)
        } else {
          toast.success("Course published successfully!")
          navigate(`/courses/${savedCourse.Id}/edit`)
        }
      }

    } catch (err) {
      if (isDraft) {
        setDraftStatus("Failed to save draft")
      } else {
        toast.error("Failed to publish course: " + err.message)
      }
    }
  }

  const handleAutoSave = () => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }
    
    const timer = setTimeout(() => {
      handleSaveCourse(true)
    }, 1000) // Auto-save after 1 second of inactivity
    
    setAutoSaveTimer(timer)
  }

  const handleAddModule = async () => {
    try {
      if (!isEditing) {
        toast.error("Please save the course first")
        return
      }

      const newModule = await moduleService.create({
        courseId: parseInt(courseId),
        title: "New Module",
        orderIndex: modules.length + 1
      })

      setModules([...modules, { ...newModule, lessons: [] }])
      toast.success("Module added successfully!")

    } catch (err) {
      toast.error("Failed to add module: " + err.message)
    }
  }

  const handleUpdateModule = async (moduleId, title) => {
    try {
      await moduleService.update(moduleId, { title })
      setModules(modules.map(m => 
        m.Id === moduleId ? { ...m, title } : m
      ))
    } catch (err) {
      toast.error("Failed to update module: " + err.message)
    }
  }

  const handleAddLesson = (module) => {
    setSelectedModule(module)
    setSelectedLesson(null)
    setLessonFormData({
      title: "",
      content: "",
      videoUrl: "",
      resources: [],
      faq: [],
      requiresSubmission: false
    })
    setLessonFormStep(1)
    setShowLessonBuilder(true)
  }

  const handleEditLesson = (module, lesson) => {
    setSelectedModule(module)
    setSelectedLesson(lesson)
    setLessonFormData({
      title: lesson.title,
      content: lesson.content,
      videoUrl: lesson.videoUrl,
      resources: lesson.resources || [],
      faq: lesson.faq || [],
      requiresSubmission: lesson.requiresSubmission
    })
    setLessonFormStep(1)
    setShowLessonBuilder(true)
  }

  const handleSaveLesson = async () => {
    try {
      if (!lessonFormData.title.trim()) {
        toast.error("Please enter a lesson title")
        return
      }

      let savedLesson
      if (selectedLesson) {
savedLesson = await lessonService.update(selectedLesson.Id, {
          ...lessonFormData,
          status: "published"
        })
        toast.success("Lesson updated successfully!")
      } else {
savedLesson = await lessonService.create({
          ...lessonFormData,
          moduleId: selectedModule.Id,
          orderIndex: selectedModule.lessons.length + 1,
          status: "published"
        })
        toast.success("Lesson created successfully!")
      }

      // Update local state
      setModules(modules.map(module => {
        if (module.Id === selectedModule.Id) {
          const updatedLessons = selectedLesson
            ? module.lessons.map(l => l.Id === selectedLesson.Id ? savedLesson : l)
            : [...module.lessons, savedLesson]
          return { ...module, lessons: updatedLessons }
        }
        return module
      }))

      setShowLessonBuilder(false)

    } catch (err) {
      toast.error("Failed to save lesson: " + err.message)
    }
  }

  const addResource = () => {
    setLessonFormData({
      ...lessonFormData,
      resources: [...lessonFormData.resources, { title: "", url: "", type: "link" }]
    })
  }

  const updateResource = (index, field, value) => {
    const updated = lessonFormData.resources.map((resource, i) =>
      i === index ? { ...resource, [field]: value } : resource
    )
    setLessonFormData({ ...lessonFormData, resources: updated })
  }

  const removeResource = (index) => {
    const updated = lessonFormData.resources.filter((_, i) => i !== index)
    setLessonFormData({ ...lessonFormData, resources: updated })
  }

  const addFAQ = () => {
    setLessonFormData({
      ...lessonFormData,
      faq: [...lessonFormData.faq, { question: "", answer: "" }]
    })
  }

  const updateFAQ = (index, field, value) => {
    const updated = lessonFormData.faq.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    setLessonFormData({ ...lessonFormData, faq: updated })
  }

  const removeFAQ = (index) => {
    const updated = lessonFormData.faq.filter((_, i) => i !== index)
    setLessonFormData({ ...lessonFormData, faq: updated })
  }

useEffect(() => {
    loadCourseData()
  }, [courseId])

  // Auto-save when courseData changes
  useEffect(() => {
    if (courseData.title || courseData.description) {
      handleAutoSave()
    }
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
      }
    }
  }, [courseData])

  if (loading) return <Loading type="skeleton" />
  if (error) return <Error message={error} onRetry={loadCourseData} />

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
<div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Create Course
          </h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-gray-600">
              Build engaging courses with structured modules and lessons
            </p>
            {draftStatus && (
              <div className="flex items-center text-sm text-green-600 bg-green-50 px-2 py-1 rounded-md">
                <ApperIcon name="Check" className="h-4 w-4 mr-1" />
                {draftStatus}
              </div>
            )}
          </div>
        </div>
        
<div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/courses")}>
            <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          <Button onClick={() => handleSaveCourse(false)}>
            <ApperIcon name="Send" className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

<div className="space-y-6">
        {/* Course Details */}
<Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<Input
              label="Course Title"
              value={courseData.title}
              onChange={(e) => setCourseData({...courseData, title: e.target.value})}
              placeholder="Enter course title"
            />
            
<Textarea
              label="Description"
              value={courseData.description}
              onChange={(e) => setCourseData({...courseData, description: e.target.value})}
              placeholder="Describe your course content and objectives"
              rows={4}
            />
            
            <div className="space-y-4">
<Select
                label="Course Status"
                value={courseData.status}
                onChange={(e) => setCourseData({...courseData, status: e.target.value})}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Select>
              
              <div className="pt-4 border-t border-gray-200">
                <StatusBadge status={courseData.status} type="course" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Structure */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Course Structure</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddModule}
                disabled={!isEditing}
              >
                <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <div className="text-center py-8 text-gray-500">
                Save the course first to add modules and lessons
              </div>
            ) : modules.length === 0 ? (
              <div className="text-center py-8">
                <ApperIcon name="BookOpen" className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h3>
                <p className="text-gray-500 mb-4">Start building your course by adding the first module</p>
                <Button onClick={handleAddModule}>
                  <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                  Add First Module
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((module, moduleIndex) => (
                  <motion.div
                    key={module.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: moduleIndex * 0.1 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                        {moduleIndex + 1}
                      </div>
                      <Input
                        value={module.title}
                        onChange={(e) => handleUpdateModule(module.Id, e.target.value)}
                        className="border-0 bg-transparent text-lg font-semibold p-0 focus:ring-0"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddLesson(module)}
                      >
                        <ApperIcon name="Plus" className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Lessons */}
                    <div className="ml-11 space-y-2">
                      {module.lessons?.map((lesson, lessonIndex) => (
                        <div key={lesson.Id} className="space-y-2">
                          <div
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleEditLesson(module, lesson)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-6 w-6 bg-accent-500 rounded-full flex items-center justify-center text-white text-xs">
                                {lessonIndex + 1}
                              </div>
                              <span className="font-medium">{lesson.title}</span>
                              {lesson.requiresSubmission && (
                                <ApperIcon name="FileText" className="h-4 w-4 text-warning-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              {courseData.dripSchedule.enabled && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <ApperIcon name="Clock" className="h-4 w-4" />
                                  <span>
                                    Day {courseData.dripSchedule.lessons[lesson.Id] || (moduleIndex * 10 + lessonIndex + 1)}
                                  </span>
                                </div>
                              )}
                              <StatusBadge status={lesson.status} type="lesson" />
                            </div>
                          </div>
                          
                          {courseData.dripSchedule.enabled && (
                            <div className="ml-9 flex items-center gap-3 p-2 bg-blue-50 rounded text-sm">
                              <ApperIcon name="Calendar" className="h-4 w-4 text-blue-600" />
                              <span className="text-blue-800">Will be released</span>
                              <Input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={courseData.dripSchedule.lessons[lesson.Id] || ""}
                                onChange={(e) => setCourseData({
                                  ...courseData,
                                  dripSchedule: {
                                    ...courseData.dripSchedule,
                                    lessons: {
                                      ...courseData.dripSchedule.lessons,
                                      [lesson.Id]: parseInt(e.target.value) || 0
                                    }
                                  }
                                })}
                                className="w-20 h-8"
                              />
                              <span className="text-blue-800">
                                days after the {
                                  courseData.dripSchedule.type === "enrollment" ? "student enrollment date" :
                                  courseData.dripSchedule.type === "start_date" ? "student start date" :
                                  "course release date"
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {(!module.lessons || module.lessons.length === 0) && (
                        <div className="text-sm text-gray-500 italic p-3">
                          No lessons yet. Click + to add the first lesson.
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Drip Schedule */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Drip Schedule</CardTitle>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enableDrip"
                  checked={courseData.dripSchedule.enabled}
                  onChange={(e) => setCourseData({
                    ...courseData,
                    dripSchedule: {
                      ...courseData.dripSchedule,
                      enabled: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="enableDrip" className="text-sm font-medium text-gray-700">
                  Enable content dripping
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!courseData.dripSchedule.enabled ? (
              <div className="text-center py-8 text-gray-500">
                <ApperIcon name="Clock" className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Drip Schedule Disabled</h3>
                <p className="text-gray-500 mb-4">Enable drip schedule to control when course content is released to students</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Select
                    label="Drip Type"
                    value={courseData.dripSchedule.type}
                    onChange={(e) => setCourseData({
                      ...courseData,
                      dripSchedule: {
                        ...courseData.dripSchedule,
                        type: e.target.value,
                        specificDate: e.target.value !== "specific_date" ? null : courseData.dripSchedule.specificDate
                      }
                    })}
                  >
                    <option value="enrollment">Student enrollment date</option>
                    <option value="start_date">Student start date</option>
                    <option value="specific_date">On a specific date</option>
                  </Select>

                  {courseData.dripSchedule.type === "specific_date" && (
                    <Input
                      type="date"
                      label="Release Date"
                      value={courseData.dripSchedule.specificDate || ""}
                      onChange={(e) => setCourseData({
                        ...courseData,
                        dripSchedule: {
                          ...courseData.dripSchedule,
                          specificDate: e.target.value
                        }
                      })}
                    />
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <ApperIcon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">How drip scheduling works:</p>
                      <ul className="space-y-1 text-blue-700">
                        <li>• <strong>Student enrollment date:</strong> Content releases based on when student enrolled</li>
                        <li>• <strong>Student start date:</strong> Content releases when student first accesses the course</li>
                        <li>• <strong>Specific date:</strong> Content releases on the date you choose for all students</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <p className="text-sm text-gray-600 mt-2">Set the pricing option for your course. All changes are automatically saved.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Free Option */}
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  courseData.pricing.type === 'free' 
                    ? 'border-primary-300 bg-primary-50 ring-2 ring-primary-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  const updatedData = {
                    ...courseData,
                    pricing: { 
                      ...courseData.pricing, 
                      type: 'free',
                      price: null,
                      monthlyPrice: null
                    }
                  };
                  setCourseData(updatedData);
                  handleSaveCourse();
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex items-center pt-1">
                    <input
                      type="radio"
                      name="pricing"
                      value="free"
                      checked={courseData.pricing.type === 'free'}
                      onChange={() => {}}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Free</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Offer free content to your subscribers. Optionally, you can set an enrollment duration that will limit the time students have access to your content.
                    </p>
                    {courseData.pricing.type === 'free' && (
                      <div className="mt-4 space-y-3">
                        <Input
                          type="number"
                          placeholder="Number of days"
                          value={courseData.pricing.daysUntilExpiry || ""}
                          onChange={(e) => {
                            const updatedData = {
                              ...courseData,
                              pricing: {
                                ...courseData.pricing,
                                daysUntilExpiry: e.target.value ? parseInt(e.target.value) : null
                              }
                            };
                            setCourseData(updatedData);
                            handleSaveCourse();
                          }}
                          className="max-w-xs"
                          label="Days Until Expiry"
                        />
                        <p className="text-xs text-gray-500">Leave blank for unlimited access.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* One-time Payment Option */}
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  courseData.pricing.type === 'one_time' 
                    ? 'border-primary-300 bg-primary-50 ring-2 ring-primary-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  const updatedData = {
                    ...courseData,
                    pricing: { 
                      ...courseData.pricing, 
                      type: 'one_time',
                      monthlyPrice: null
                    }
                  };
                  setCourseData(updatedData);
                  handleSaveCourse();
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex items-center pt-1">
                    <input
                      type="radio"
                      name="pricing"
                      value="one_time"
                      checked={courseData.pricing.type === 'one_time'}
                      onChange={() => {}}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">One-time payment</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Charge students a single fee to access the complete course content forever.
                    </p>
                    {courseData.pricing.type === 'one_time' && (
                      <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3 max-w-md">
                          <div>
                            <Select
                              label="Currency"
                              value={courseData.pricing.currency}
                              onChange={(e) => {
                                const updatedData = {
                                  ...courseData,
                                  pricing: {
                                    ...courseData.pricing,
                                    currency: e.target.value
                                  }
                                };
                                setCourseData(updatedData);
                                handleSaveCourse();
                              }}
                            >
                              <option value="USD">USD ($)</option>
                              <option value="EUR">EUR (€)</option>
                              <option value="GBP">GBP (£)</option>
                              <option value="CAD">CAD (C$)</option>
                              <option value="AUD">AUD (A$)</option>
                              <option value="JPY">JPY (¥)</option>
                            </Select>
                          </div>
                          <div>
                            <Input
                              type="number"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              value={courseData.pricing.price || ""}
                              onChange={(e) => {
                                const updatedData = {
                                  ...courseData,
                                  pricing: {
                                    ...courseData.pricing,
                                    price: e.target.value ? parseFloat(e.target.value) : null
                                  }
                                };
                                setCourseData(updatedData);
                                handleSaveCourse();
                              }}
                              label="Price"
                            />
                          </div>
                        </div>
                        <Input
                          type="number"
                          placeholder="Number of days"
                          value={courseData.pricing.daysUntilExpiry || ""}
                          onChange={(e) => {
                            const updatedData = {
                              ...courseData,
                              pricing: {
                                ...courseData.pricing,
                                daysUntilExpiry: e.target.value ? parseInt(e.target.value) : null
                              }
                            };
                            setCourseData(updatedData);
                            handleSaveCourse();
                          }}
                          className="max-w-xs"
                          label="Access Duration (Optional)"
                        />
                        <p className="text-xs text-gray-500">Leave access duration blank for lifetime access.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Subscription/Membership Option */}
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  courseData.pricing.type === 'subscription' 
                    ? 'border-primary-300 bg-primary-50 ring-2 ring-primary-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  const updatedData = {
                    ...courseData,
                    pricing: { 
                      ...courseData.pricing, 
                      type: 'subscription',
                      price: null,
                      daysUntilExpiry: null
                    }
                  };
                  setCourseData(updatedData);
                  handleSaveCourse();
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex items-center pt-1">
                    <input
                      type="radio"
                      name="pricing"
                      value="subscription"
                      checked={courseData.pricing.type === 'subscription'}
                      onChange={() => {}}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Subscription / Membership</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Charge students a recurring monthly fee for continuous access to course content.
                    </p>
                    {courseData.pricing.type === 'subscription' && (
                      <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3 max-w-md">
                          <div>
                            <Select
                              label="Currency"
                              value={courseData.pricing.currency}
                              onChange={(e) => {
                                const updatedData = {
                                  ...courseData,
                                  pricing: {
                                    ...courseData.pricing,
                                    currency: e.target.value
                                  }
                                };
                                setCourseData(updatedData);
                                handleSaveCourse();
                              }}
                            >
                              <option value="USD">USD ($)</option>
                              <option value="EUR">EUR (€)</option>
                              <option value="GBP">GBP (£)</option>
                              <option value="CAD">CAD (C$)</option>
                              <option value="AUD">AUD (A$)</option>
                              <option value="JPY">JPY (¥)</option>
                            </Select>
                          </div>
                          <div>
                            <Input
                              type="number"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              value={courseData.pricing.monthlyPrice || ""}
                              onChange={(e) => {
                                const updatedData = {
                                  ...courseData,
                                  pricing: {
                                    ...courseData.pricing,
                                    monthlyPrice: e.target.value ? parseFloat(e.target.value) : null
                                  }
                                };
                                setCourseData(updatedData);
                                handleSaveCourse();
                              }}
                              label="Monthly Price"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">Students will be charged this amount every month for access.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Monthly Payment Plan Option */}
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  courseData.pricing.type === 'monthly_plan' 
                    ? 'border-primary-300 bg-primary-50 ring-2 ring-primary-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  const updatedData = {
                    ...courseData,
                    pricing: { 
                      ...courseData.pricing, 
                      type: 'monthly_plan',
                      daysUntilExpiry: null
                    }
                  };
                  setCourseData(updatedData);
                  handleSaveCourse();
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex items-center pt-1">
                    <input
                      type="radio"
                      name="pricing"
                      value="monthly_plan"
                      checked={courseData.pricing.type === 'monthly_plan'}
                      onChange={() => {}}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Monthly Payment Plan</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Allow students to split the total course fee into manageable monthly installments.
                    </p>
                    {courseData.pricing.type === 'monthly_plan' && (
                      <div className="mt-4 space-y-3">
                        <div className="grid grid-cols-3 gap-3 max-w-lg">
                          <div>
                            <Select
                              label="Currency"
                              value={courseData.pricing.currency}
                              onChange={(e) => {
                                const updatedData = {
                                  ...courseData,
                                  pricing: {
                                    ...courseData.pricing,
                                    currency: e.target.value
                                  }
                                };
                                setCourseData(updatedData);
                                handleSaveCourse();
                              }}
                            >
                              <option value="USD">USD ($)</option>
                              <option value="EUR">EUR (€)</option>
                              <option value="GBP">GBP (£)</option>
                              <option value="CAD">CAD (C$)</option>
                              <option value="AUD">AUD (A$)</option>
                              <option value="JPY">JPY (¥)</option>
                            </Select>
                          </div>
                          <div>
                            <Input
                              type="number"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              value={courseData.pricing.price || ""}
                              onChange={(e) => {
                                const updatedData = {
                                  ...courseData,
                                  pricing: {
                                    ...courseData.pricing,
                                    price: e.target.value ? parseFloat(e.target.value) : null
                                  }
                                };
                                setCourseData(updatedData);
                                handleSaveCourse();
                              }}
                              label="Total Price"
                            />
                          </div>
                          <div>
                            <Input
                              type="number"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              value={courseData.pricing.monthlyPrice || ""}
                              onChange={(e) => {
                                const updatedData = {
                                  ...courseData,
                                  pricing: {
                                    ...courseData.pricing,
                                    monthlyPrice: e.target.value ? parseFloat(e.target.value) : null
                                  }
                                };
                                setCourseData(updatedData);
                                handleSaveCourse();
                              }}
                              label="Monthly Amount"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Students pay the monthly amount until the total price is reached, then get lifetime access.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lesson Builder Modal */}
      <AnimatePresence>
        {showLessonBuilder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowLessonBuilder(false)
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    {selectedLesson ? "Edit Lesson" : "Create New Lesson"}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLessonBuilder(false)}
                  >
                    <ApperIcon name="X" className="h-5 w-5" />
                  </Button>
                </div>

                {/* Steps Indicator */}
                <div className="flex items-center mt-6">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step <= lessonFormStep
                            ? "bg-primary-600 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {step}
                      </div>
                      {step < 3 && (
                        <div className={`w-16 h-1 ${
                          step < lessonFormStep ? "bg-primary-600" : "bg-gray-200"
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* Step 1: Video */}
                {lessonFormStep === 1 && (
<div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 1: Add Training Video</h3>
                    <Input
                      label="Lesson Title"
                      value={lessonFormData.title}
                      onChange={(e) => setLessonFormData({...lessonFormData, title: e.target.value})}
                      placeholder="Enter lesson title"
                    />
                    <Input
                      label="Video URL (YouTube, Vimeo, etc.)"
                      value={lessonFormData.videoUrl}
                      onChange={(e) => setLessonFormData({...lessonFormData, videoUrl: e.target.value})}
                      placeholder="https://www.youtube.com/embed/..."
                    />
                    {lessonFormData.videoUrl && (
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <iframe
                          src={lessonFormData.videoUrl}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Content */}
                {lessonFormStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Step 2: Add Content & Resources</h3>
                    
                    <Textarea
                      label="Lesson Content"
                      value={lessonFormData.content}
                      onChange={(e) => setLessonFormData({...lessonFormData, content: e.target.value})}
                      placeholder="Describe the lesson content, learning objectives, and key points"
                      rows={6}
                    />

                    {/* Resources */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700">Resources</label>
                        <Button variant="outline" size="sm" onClick={addResource}>
                          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                          Add Resource
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {lessonFormData.resources.map((resource, index) => (
                          <div key={index} className="flex gap-3 p-3 border border-gray-200 rounded-lg">
                            <Input
                              placeholder="Resource title"
                              value={resource.title}
                              onChange={(e) => updateResource(index, "title", e.target.value)}
                              className="flex-1"
                            />
                            <Input
                              placeholder="URL"
                              value={resource.url}
                              onChange={(e) => updateResource(index, "url", e.target.value)}
                              className="flex-1"
                            />
                            <Select
                              value={resource.type}
                              onChange={(e) => updateResource(index, "type", e.target.value)}
                              className="w-32"
                            >
                              <option value="link">Link</option>
                              <option value="pdf">PDF</option>
                              <option value="video">Video</option>
                              <option value="document">Document</option>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeResource(index)}
                            >
                              <ApperIcon name="Trash2" className="h-4 w-4 text-error-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FAQ */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-700">FAQ</label>
                        <Button variant="outline" size="sm" onClick={addFAQ}>
                          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                          Add FAQ
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {lessonFormData.faq.map((item, index) => (
                          <div key={index} className="space-y-2 p-3 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start">
                              <Input
                                placeholder="Question"
                                value={item.question}
                                onChange={(e) => updateFAQ(index, "question", e.target.value)}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFAQ(index)}
                              >
                                <ApperIcon name="Trash2" className="h-4 w-4 text-error-500" />
                              </Button>
                            </div>
                            <Textarea
                              placeholder="Answer"
                              value={item.answer}
                              onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                              rows={2}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Homework */}
                {lessonFormStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 3: Homework Settings</h3>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="requiresSubmission"
                        checked={lessonFormData.requiresSubmission}
                        onChange={(e) => setLessonFormData({
                          ...lessonFormData,
                          requiresSubmission: e.target.checked
                        })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="requiresSubmission" className="text-sm font-medium text-gray-700">
                        Require homework submission for this lesson
                      </label>
                    </div>

                    {lessonFormData.requiresSubmission && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Homework Instructions</h4>
                        <p className="text-sm text-blue-700 mb-4">
                          Students will be able to submit text responses and file attachments for this lesson.
                          The submission will be sent to coaches for review and feedback.
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-blue-700">
                          <ApperIcon name="CheckCircle" className="h-4 w-4" />
                          <span>Text submission enabled</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-blue-700">
                          <ApperIcon name="CheckCircle" className="h-4 w-4" />
                          <span>File upload enabled</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-blue-700">
                          <ApperIcon name="CheckCircle" className="h-4 w-4" />
                          <span>Coach review and feedback enabled</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setLessonFormStep(Math.max(1, lessonFormStep - 1))}
                    disabled={lessonFormStep === 1}
                  >
                    <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  
                  {lessonFormStep < 3 ? (
                    <Button
                      onClick={() => setLessonFormStep(lessonFormStep + 1)}
                    >
                      Next
                      <ApperIcon name="ArrowRight" className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={handleSaveLesson}>
                      <ApperIcon name="Save" className="h-4 w-4 mr-2" />
                      Save Lesson
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CourseBuilder