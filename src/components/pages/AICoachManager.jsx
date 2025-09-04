import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Textarea from '@/components/atoms/Textarea'
import Select from '@/components/atoms/Select'
import Badge from '@/components/atoms/Badge'
import ApperIcon from '@/components/ApperIcon'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import { aiCoachService } from '@/services/api/aiCoachService'
import { courseService } from '@/services/api/courseService'
import { bundleService } from '@/services/api/bundleService'

const AICoachManager = () => {
  const [coaches, setCoaches] = useState([])
  const [courses, setCourses] = useState([])
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCoach, setEditingCoach] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
const [formData, setFormData] = useState({
    name: "",
    description: "",
    prompt: "",
    knowledgeBase: [],
    status: "draft",
    instructions: ""
  })
  const [dragOver, setDragOver] = useState(false)

  const loadData = async () => {
    try {
      setError("")
      setLoading(true)
      
      const [coachesData, coursesData, bundlesData] = await Promise.all([
        aiCoachService.getAll(),
        courseService.getAll(),
        bundleService.getAll()
      ])

      setCoaches(coachesData)
      setCourses(coursesData)
      setBundles(bundlesData)

    } catch (err) {
      console.error("Failed to load data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCoach = async () => {
try {
      if (!formData.name.trim()) {
        toast.error("Please enter a coach name")
        return
      }

      if (editingCoach) {
        await aiCoachService.update(editingCoach.Id, formData)
        toast.success("AI Coach updated successfully!")
      } else {
        await aiCoachService.create(formData)
        toast.success("AI Coach created successfully!")
      }

      resetForm()
      loadData()

    } catch (err) {
      toast.error("Failed to save AI Coach: " + err.message)
    }
  }

  const handleDeleteCoach = async (coachId, coachName) => {
    if (!confirm(`Are you sure you want to delete "${coachName}"?`)) return

    try {
      await aiCoachService.delete(coachId)
      toast.success("AI Coach deleted successfully!")
      loadData()
    } catch (err) {
      toast.error("Failed to delete AI Coach: " + err.message)
    }
  }

  const handleTrainCoach = async (coachId) => {
    try {
      const coach = coaches.find(c => c.Id === coachId)
      await aiCoachService.update(coachId, { status: "training" })
      toast.success(`Training started for ${coach.name}`)
      
      // Simulate training completion after 3 seconds
      setTimeout(async () => {
        await aiCoachService.update(coachId, { status: "active" })
        toast.success(`${coach.name} is now trained and ready!`)
        loadData()
      }, 3000)
      
      loadData()
    } catch (err) {
      toast.error("Failed to start training: " + err.message)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
description: "",
      prompt: "",
      knowledgeBase: [],
      status: "draft",
      instructions: ""
    })
    setCurrentStep(1)
    setShowCreateForm(false)
    setEditingCoach(null)
  }

const handleEdit = (coach) => {
    setFormData({
      ...coach,
      knowledgeBase: coach.knowledgeBase || []
    })
    setEditingCoach(coach)
    setShowCreateForm(true)
    setCurrentStep(1)
  }

  // File upload handlers
  const handleFileUpload = useCallback((files) => {
    const validFiles = Array.from(files).filter(file => {
      const validTypes = ['application/pdf', 'image/*', 'video/*']
      const maxSize = 50 * 1024 * 1024 // 50MB
      
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 50MB.`)
        return false
      }
      
      const isValidType = validTypes.some(type => 
        type.endsWith('/*') ? file.type.startsWith(type.slice(0, -2)) : file.type === type
      )
      
      if (!isValidType) {
        toast.error(`File ${file.name} is not a supported type. Please upload PDF, image, or video files.`)
        return false
      }
      
      return true
    })

    if (validFiles.length === 0) return

    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      file: file,
      uploadedAt: new Date().toISOString()
    }))

    setFormData(prev => ({
      ...prev,
      knowledgeBase: [...prev.knowledgeBase, ...newFiles]
    }))

    toast.success(`${newFiles.length} file(s) added to knowledge base`)
  }, [])

  const handleUrlAdd = useCallback((url) => {
    if (!url.trim()) return

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      toast.error('Please enter a valid URL')
      return
    }

    const newUrlItem = {
      id: Date.now(),
      name: url,
      type: 'url',
      url: url,
      uploadedAt: new Date().toISOString()
    }

    setFormData(prev => ({
      ...prev,
      knowledgeBase: [...prev.knowledgeBase, newUrlItem]
    }))

    toast.success('URL added to knowledge base')
  }, [])

  const handleFileRemove = useCallback((fileId) => {
    setFormData(prev => ({
      ...prev,
      knowledgeBase: prev.knowledgeBase.filter(file => file.id !== fileId)
    }))
    toast.success('File removed from knowledge base')
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }, [handleFileUpload])

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type) => {
    if (type === 'url') return 'Link'
    if (type === 'application/pdf') return 'FileText'
    if (type.startsWith('image/')) return 'Image'
    if (type.startsWith('video/')) return 'Video'
    return 'File'
  }

  const getAssignedContent = (coachId) => {
    const assignedCourses = courses.filter(c => c.aiCoachId === coachId)
    const assignedBundles = bundles.filter(b => b.aiCoachId === coachId)
    return { courses: assignedCourses, bundles: assignedBundles }
  }

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) return <Loading type="skeleton" />
  if (error) return <Error message={error} onRetry={loadData} />

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Step 1: Basic Information & Instructions
              </h3>
              <p className="text-gray-600 mb-6">
                Set up your AI Coach with basic details and provide clear instructions on its role and behavior.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Coach Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Marketing Course Assistant"
              />

              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of what this AI coach helps with..."
                rows={3}
              />

              <Textarea
                label="Instructions for AI Coach"
                value={formData.instructions}
                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                placeholder="Provide clear instructions on how the AI should behave, its role, tone, and any specific guidelines..."
                rows={5}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ApperIcon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Pro Tip</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Be specific about the AI's role, expertise area, and how it should interact with students. 
                    This helps create a more personalized learning experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Step 2: Customize Prompt
              </h3>
              <p className="text-gray-600 mb-6">
                Create a custom prompt that defines how your AI Coach will respond to student questions.
              </p>
            </div>

            <Textarea
              label="Custom Prompt"
              value={formData.prompt}
              onChange={(e) => setFormData({...formData, prompt: e.target.value})}
              placeholder="You are an expert AI coach specialized in [subject]. Your role is to help students by providing clear, actionable guidance based on the course content. Always be encouraging and provide specific examples..."
              rows={8}
            />

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ApperIcon name="Lightbulb" className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-900">Best Practice</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Include context about the subject matter, desired tone, and specific instructions 
                    for handling different types of questions. This ensures consistent, high-quality responses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Step 3: Knowledge Base Training
              </h3>
              <p className="text-gray-600 mb-6">
                Upload files and resources to train your AI Coach on specific content and knowledge.
              </p>
            </div>

            {/* File Upload Area */}
            <div 
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
                ${dragOver 
                  ? 'border-primary-400 bg-primary-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="mx-auto h-16 w-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                  <ApperIcon name="Upload" className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Upload Knowledge Base Files
                  </h4>
                  <p className="text-gray-500 mb-4">
                    Drag and drop files here, or click to browse
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <ApperIcon name="FileText" className="h-4 w-4" />
                      PDF
                    </span>
                    <span className="flex items-center gap-1">
                      <ApperIcon name="Image" className="h-4 w-4" />
                      Images
                    </span>
                    <span className="flex items-center gap-1">
                      <ApperIcon name="Video" className="h-4 w-4" />
                      Videos
                    </span>
                    <span className="flex items-center gap-1">
                      <ApperIcon name="Link" className="h-4 w-4" />
                      URLs
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => document.getElementById('file-upload').click()}
                    className="flex items-center gap-2"
                  >
                    <ApperIcon name="Plus" className="h-4 w-4" />
                    Choose Files
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const url = prompt('Enter URL:')
                      if (url) handleUrlAdd(url)
                    }}
                    className="flex items-center gap-2"
                  >
                    <ApperIcon name="Link" className="h-4 w-4" />
                    Add URL
                  </Button>
                </div>
              </div>
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,image/*,video/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Uploaded Files Display */}
            {formData.knowledgeBase.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <ApperIcon name="Database" className="h-5 w-5" />
                  Knowledge Base Files ({formData.knowledgeBase.length})
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {formData.knowledgeBase.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-50 rounded-lg flex items-center justify-center">
                          <ApperIcon 
                            name={getFileIcon(file.type)} 
                            className="h-5 w-5 text-primary-600" 
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {file.type === 'url' ? 'Website' : formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFileRemove(file.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-red-600"
                      >
                        <ApperIcon name="Trash2" className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Training Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <ApperIcon name="Brain" className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">AI Training Process</h4>
                  <p className="text-sm text-blue-700">Your files will be processed and used to train the AI coach</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <ApperIcon name="Check" className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">Extracts and analyzes content from uploaded files</span>
                </div>
                <div className="flex items-center space-x-3">
                  <ApperIcon name="Check" className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">Learns domain-specific terminology and concepts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <ApperIcon name="Check" className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">Provides contextually relevant, accurate responses</span>
                </div>
                <div className="flex items-center space-x-3">
                  <ApperIcon name="Check" className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">References specific content from your uploaded materials</span>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            AI Coach Manager
          </h1>
          <p className="text-gray-600 mt-1">
            Create and manage AI coaches trained on your course content
          </p>
        </div>
        
        <Button
          onClick={() => setShowCreateForm(true)}
          variant="primary"
        >
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Create AI Coach
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{editingCoach ? "Edit AI Coach" : "Create New AI Coach"}</CardTitle>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <ApperIcon name="X" className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Step Progress */}
            <div className="flex items-center space-x-4 mt-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`h-0.5 w-8 ${currentStep > step ? 'bg-primary-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </CardHeader>
          
          <CardContent>
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-100 mt-6">
              <Button 
                variant="outline" 
                onClick={prevStep} 
                disabled={currentStep === 1}
              >
                <ApperIcon name="ChevronLeft" className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex gap-3">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                
                {currentStep < 3 ? (
                  <Button onClick={nextStep}>
                    Next
                    <ApperIcon name="ChevronRight" className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleCreateCoach}>
                    <ApperIcon name="Save" className="h-4 w-4 mr-2" />
                    {editingCoach ? "Update Coach" : "Create Coach"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Coaches List */}
      {coaches.length === 0 ? (
        <Empty
          icon="Brain"
          title="No AI Coaches created yet"
          message="Create your first AI coach to provide personalized assistance to your students. AI coaches are trained on your actual course content."
          actionLabel="Create AI Coach"
          onAction={() => setShowCreateForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.map((coach, index) => {
            const assigned = getAssignedContent(coach.Id)
            
            return (
              <motion.div
                key={coach.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:border-gray-200 transition-all duration-200 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <ApperIcon name="Brain" className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{coach.name}</h3>
                          <p className="text-sm text-gray-500">
                            {assigned.courses.length + assigned.bundles.length} assignments
                          </p>
                        </div>
                      </div>
                      
                      <Badge variant={
                        coach.status === 'active' ? 'success' : 
                        coach.status === 'training' ? 'warning' : 'default'
                      }>
                        {coach.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {coach.description}
                    </p>

                    {/* Assigned Content */}
                    <div className="space-y-2 mb-4">
                      <div className="text-xs text-gray-500">ASSIGNED TO:</div>
                      <div className="flex flex-wrap gap-1">
                        {assigned.courses.map(course => (
                          <Badge key={`course-${course.Id}`} variant="info" size="sm">
                            {course.title}
                          </Badge>
                        ))}
                        {assigned.bundles.map(bundle => (
                          <Badge key={`bundle-${bundle.Id}`} variant="secondary" size="sm">
                            {bundle.title}
                          </Badge>
                        ))}
                        {assigned.courses.length === 0 && assigned.bundles.length === 0 && (
                          <span className="text-xs text-gray-400">Not assigned</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {coach.status === 'draft' && (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleTrainCoach(coach.Id)}
                        >
                          <ApperIcon name="Play" className="h-4 w-4 mr-2" />
                          Train
                        </Button>
                      )}
                      
                      {coach.status === 'training' && (
                        <Button 
                          variant="warning" 
                          size="sm" 
                          className="flex-1"
                          disabled
                        >
                          <ApperIcon name="Loader" className="h-4 w-4 mr-2 animate-spin" />
                          Training...
                        </Button>
                      )}

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(coach)}
                      >
                        <ApperIcon name="Edit" className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteCoach(coach.Id, coach.name)}
                      >
                        <ApperIcon name="Trash2" className="h-4 w-4" />
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

export default AICoachManager