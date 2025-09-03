import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Textarea from '@/components/atoms/Textarea'
import Select from '@/components/atoms/Select'
import ApperIcon from '@/components/ApperIcon'
import StatusBadge from '@/components/molecules/StatusBadge'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import { bundleService } from '@/services/api/bundleService'
import { courseService } from '@/services/api/courseService'

function CourseBundleBuilder() {
  const { bundleId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(bundleId)
  
  const [bundleData, setBundleData] = useState({
    title: '',
    description: '',
    courses: [],
    status: 'draft',
    pricing: {
      type: 'free',
      currency: 'USD',
      price: null,
      monthlyPrice: null,
      daysUntilExpiry: null
    },
    dripSchedule: {
      enabled: false,
      type: 'enrollment',
      specificDate: null,
      courseSchedule: {}
    },
    settings: {
      allowCourseSkipping: false,
      requireSequentialCompletion: true,
      certificateEnabled: true,
      discussionEnabled: true
    }
  })

  const [availableCourses, setAvailableCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [draftStatus, setDraftStatus] = useState('')

  useEffect(() => {
    loadData()
  }, [bundleId])

  async function loadData() {
    try {
      setLoading(true)
      const [coursesData, bundleDataResult] = await Promise.all([
        courseService.getAll(),
        isEditing ? bundleService.getById(bundleId) : Promise.resolve(null)
      ])

      setAvailableCourses(coursesData.filter(course => course.status === 'published'))
      
      if (bundleDataResult) {
        setBundleData(bundleDataResult)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setError(error.message)
      toast.error('Failed to load bundle data')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveBundle(isDraft = true) {
    try {
      setSaving(true)
      
      if (!bundleData.title.trim()) {
        toast.error('Please enter a bundle title')
        return
      }

      if (bundleData.courses.length === 0) {
        toast.error('Please select at least one course for the bundle')
        return
      }

      const dataToSave = {
        ...bundleData,
        status: isDraft ? 'draft' : 'published'
      }

      let savedBundle
      if (isEditing) {
        savedBundle = await bundleService.update(bundleId, dataToSave)
        toast.success('Bundle updated successfully')
      } else {
        savedBundle = await bundleService.create(dataToSave)
        toast.success('Bundle created successfully')
        navigate(`/bundles/${savedBundle.Id}/edit`)
      }

      setBundleData(savedBundle)
      setDraftStatus(isDraft ? 'Draft saved' : 'Published successfully')
      setTimeout(() => setDraftStatus(''), 3000)
    } catch (error) {
      console.error('Error saving bundle:', error)
      toast.error('Failed to save bundle')
    } finally {
      setSaving(false)
    }
  }

  function handleCourseToggle(courseId) {
    setBundleData(prev => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter(id => id !== courseId)
        : [...prev.courses, courseId]
    }))
  }

  function handleCourseOrderChange(courseId, direction) {
    const currentIndex = bundleData.courses.indexOf(courseId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= bundleData.courses.length) return

    const newCourses = [...bundleData.courses]
    newCourses[currentIndex] = newCourses[newIndex]
    newCourses[newIndex] = courseId

    setBundleData(prev => ({
      ...prev,
      courses: newCourses
    }))
  }

  if (loading) {
    return <Loading message="Loading bundle data..." />
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            {isEditing ? 'Edit Bundle' : 'Create Course Bundle'}
          </h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-gray-600">
              {isEditing ? 'Update your course bundle settings and content' : 'Combine multiple courses into a comprehensive learning bundle'}
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
          <Button onClick={() => handleSaveBundle(false)} loading={saving}>
            <ApperIcon name="Send" className="h-4 w-4 mr-2" />
            Publish Bundle
          </Button>
        </div>
      </div>

      {/* Bundle Details */}
      <Card>
        <CardHeader>
          <CardTitle>Bundle Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Input
            label="Bundle Title"
            value={bundleData.title}
            onChange={(e) => setBundleData({...bundleData, title: e.target.value})}
            placeholder="Enter bundle title"
          />
          
          <Textarea
            label="Description"
            value={bundleData.description}
            onChange={(e) => setBundleData({...bundleData, description: e.target.value})}
            placeholder="Describe your course bundle and its benefits"
            rows={4}
          />
          
          <div className="space-y-4">
            <Select
              label="Bundle Status"
              value={bundleData.status}
              onChange={(e) => setBundleData({...bundleData, status: e.target.value})}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>
            
            <div className="pt-4 border-t border-gray-200">
              <StatusBadge status={bundleData.status} type="bundle" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Course Selection</CardTitle>
          <p className="text-sm text-gray-600">Choose courses to include in this bundle. Drag to reorder.</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Selected Courses */}
            {bundleData.courses.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Selected Courses ({bundleData.courses.length})</h3>
                <div className="space-y-2">
                  {bundleData.courses.map((courseId, index) => {
                    const course = availableCourses.find(c => c.Id === courseId)
                    if (!course) return null

                    return (
                      <div key={courseId} className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{course.title}</h4>
                            <p className="text-sm text-gray-600">{course.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCourseOrderChange(courseId, 'up')}
                            disabled={index === 0}
                          >
                            <ApperIcon name="ChevronUp" className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCourseOrderChange(courseId, 'down')}
                            disabled={index === bundleData.courses.length - 1}
                          >
                            <ApperIcon name="ChevronDown" className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCourseToggle(courseId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <ApperIcon name="X" className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Available Courses */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Available Courses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {availableCourses
                  .filter(course => !bundleData.courses.includes(course.Id))
                  .map(course => (
                  <div key={course.Id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{course.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-1">{course.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCourseToggle(course.Id)}
                    >
                      <ApperIcon name="Plus" className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>

              {availableCourses.filter(course => !bundleData.courses.includes(course.Id)).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ApperIcon name="Package" className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p>All available courses have been added to this bundle</p>
                </div>
              )}
            </div>
          </div>
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
                checked={bundleData.dripSchedule.enabled}
                onChange={(e) => setBundleData({
                  ...bundleData,
                  dripSchedule: {
                    ...bundleData.dripSchedule,
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
          {!bundleData.dripSchedule.enabled ? (
            <div className="text-center py-8 text-gray-500">
              <ApperIcon name="Clock" className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Drip Schedule Disabled</h3>
              <p className="text-gray-500 mb-4">Enable drip schedule to control when courses are released to students</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Select
                  label="Drip Type"
                  value={bundleData.dripSchedule.type}
                  onChange={(e) => setBundleData({
                    ...bundleData,
                    dripSchedule: {
                      ...bundleData.dripSchedule,
                      type: e.target.value,
                      specificDate: e.target.value !== "specific_date" ? null : bundleData.dripSchedule.specificDate
                    }
                  })}
                >
                  <option value="enrollment">Student enrollment date</option>
                  <option value="start_date">Student start date</option>
                  <option value="specific_date">On a specific date</option>
                </Select>

                {bundleData.dripSchedule.type === "specific_date" && (
                  <Input
                    type="date"
                    label="Release Date"
                    value={bundleData.dripSchedule.specificDate || ""}
                    onChange={(e) => setBundleData({
                      ...bundleData,
                      dripSchedule: {
                        ...bundleData.dripSchedule,
                        specificDate: e.target.value
                      }
                    })}
                  />
                )}
              </div>

              {/* Course Schedule */}
              {bundleData.courses.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Course Release Schedule</h3>
                  <div className="space-y-3">
                    {bundleData.courses.map((courseId, index) => {
                      const course = availableCourses.find(c => c.Id === courseId)
                      if (!course) return null

                      return (
                        <div key={courseId} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                              {index + 1}
                            </div>
                            <span className="font-medium text-gray-900">{course.title}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-blue-800">Release after</span>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={bundleData.dripSchedule.courseSchedule[courseId] || ""}
                              onChange={(e) => setBundleData({
                                ...bundleData,
                                dripSchedule: {
                                  ...bundleData.dripSchedule,
                                  courseSchedule: {
                                    ...bundleData.dripSchedule.courseSchedule,
                                    [courseId]: parseInt(e.target.value) || 0
                                  }
                                }
                              })}
                              className="w-20 h-8"
                            />
                            <span className="text-sm text-blue-800">days</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
          <p className="text-sm text-gray-600 mt-2">Set the pricing option for your bundle. All changes are automatically saved.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Free Option */}
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                bundleData.pricing.type === 'free' 
                  ? 'border-primary-300 bg-primary-50 ring-2 ring-primary-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setBundleData({
                ...bundleData,
                pricing: { 
                  ...bundleData.pricing, 
                  type: 'free',
                  price: null,
                  monthlyPrice: null
                }
              })}
            >
              <div className="flex items-start space-x-3">
                <div className="flex items-center pt-1">
                  <input
                    type="radio"
                    name="pricing"
                    value="free"
                    checked={bundleData.pricing.type === 'free'}
                    onChange={() => {}}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Free Bundle</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Offer this bundle for free to your subscribers. Students get access to all included courses.
                  </p>
                  {bundleData.pricing.type === 'free' && (
                    <div className="mt-4 space-y-3">
                      <Input
                        type="number"
                        placeholder="Number of days"
                        value={bundleData.pricing.daysUntilExpiry || ""}
                        onChange={(e) => setBundleData({
                          ...bundleData,
                          pricing: {
                            ...bundleData.pricing,
                            daysUntilExpiry: e.target.value ? parseInt(e.target.value) : null
                          }
                        })}
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
                bundleData.pricing.type === 'one_time' 
                  ? 'border-primary-300 bg-primary-50 ring-2 ring-primary-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setBundleData({
                ...bundleData,
                pricing: { 
                  ...bundleData.pricing, 
                  type: 'one_time',
                  monthlyPrice: null
                }
              })}
            >
              <div className="flex items-start space-x-3">
                <div className="flex items-center pt-1">
                  <input
                    type="radio"
                    name="pricing"
                    value="one_time"
                    checked={bundleData.pricing.type === 'one_time'}
                    onChange={() => {}}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">One-time payment</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Charge students a single fee to access the complete bundle forever.
                  </p>
                  {bundleData.pricing.type === 'one_time' && (
                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3 max-w-md">
                        <div>
                          <Select
                            label="Currency"
                            value={bundleData.pricing.currency}
                            onChange={(e) => setBundleData({
                              ...bundleData,
                              pricing: {
                                ...bundleData.pricing,
                                currency: e.target.value
                              }
                            })}
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
                            value={bundleData.pricing.price || ""}
                            onChange={(e) => setBundleData({
                              ...bundleData,
                              pricing: {
                                ...bundleData.pricing,
                                price: e.target.value ? parseFloat(e.target.value) : null
                              }
                            })}
                            label="Price"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Subscription Option */}
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                bundleData.pricing.type === 'subscription' 
                  ? 'border-primary-300 bg-primary-50 ring-2 ring-primary-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setBundleData({
                ...bundleData,
                pricing: { 
                  ...bundleData.pricing, 
                  type: 'subscription',
                  price: null,
                  daysUntilExpiry: null
                }
              })}
            >
              <div className="flex items-start space-x-3">
                <div className="flex items-center pt-1">
                  <input
                    type="radio"
                    name="pricing"
                    value="subscription"
                    checked={bundleData.pricing.type === 'subscription'}
                    onChange={() => {}}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Subscription / Membership</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Charge students a recurring monthly fee for continuous access to bundle content.
                  </p>
                  {bundleData.pricing.type === 'subscription' && (
                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3 max-w-md">
                        <div>
                          <Select
                            label="Currency"
                            value={bundleData.pricing.currency}
                            onChange={(e) => setBundleData({
                              ...bundleData,
                              pricing: {
                                ...bundleData.pricing,
                                currency: e.target.value
                              }
                            })}
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
                            value={bundleData.pricing.monthlyPrice || ""}
                            onChange={(e) => setBundleData({
                              ...bundleData,
                              pricing: {
                                ...bundleData.pricing,
                                monthlyPrice: e.target.value ? parseFloat(e.target.value) : null
                              }
                            })}
                            label="Monthly Price"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Monthly Payment Plan Option */}
            <div 
              className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                bundleData.pricing.type === 'monthly_plan' 
                  ? 'border-primary-300 bg-primary-50 ring-2 ring-primary-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setBundleData({
                ...bundleData,
                pricing: { 
                  ...bundleData.pricing, 
                  type: 'monthly_plan',
                  daysUntilExpiry: null
                }
              })}
            >
              <div className="flex items-start space-x-3">
                <div className="flex items-center pt-1">
                  <input
                    type="radio"
                    name="pricing"
                    value="monthly_plan"
                    checked={bundleData.pricing.type === 'monthly_plan'}
                    onChange={() => {}}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Monthly Payment Plan</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Allow students to split the total bundle fee into manageable monthly installments.
                  </p>
                  {bundleData.pricing.type === 'monthly_plan' && (
                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-3 gap-3 max-w-lg">
                        <div>
                          <Select
                            label="Currency"
                            value={bundleData.pricing.currency}
                            onChange={(e) => setBundleData({
                              ...bundleData,
                              pricing: {
                                ...bundleData.pricing,
                                currency: e.target.value
                              }
                            })}
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
                            value={bundleData.pricing.price || ""}
                            onChange={(e) => setBundleData({
                              ...bundleData,
                              pricing: {
                                ...bundleData.pricing,
                                price: e.target.value ? parseFloat(e.target.value) : null
                              }
                            })}
                            label="Total Price"
                          />
                        </div>
                        <div>
                          <Input
                            type="number"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            value={bundleData.pricing.monthlyPrice || ""}
                            onChange={(e) => setBundleData({
                              ...bundleData,
                              pricing: {
                                ...bundleData.pricing,
                                monthlyPrice: e.target.value ? parseFloat(e.target.value) : null
                              }
                            })}
                            label="Monthly Amount"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bundle Settings */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-800">
            <ApperIcon name="Settings" className="h-6 w-6 mr-3" />
            Bundle Settings
          </CardTitle>
          <p className="text-sm text-purple-600">
            Configure how students interact with this bundle
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="allowSkipping"
                  checked={bundleData.settings.allowCourseSkipping}
                  onChange={(e) => setBundleData({
                    ...bundleData,
                    settings: {
                      ...bundleData.settings,
                      allowCourseSkipping: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="allowSkipping" className="text-sm font-medium text-gray-700">
                  Allow course skipping
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="requireSequential"
                  checked={bundleData.settings.requireSequentialCompletion}
                  onChange={(e) => setBundleData({
                    ...bundleData,
                    settings: {
                      ...bundleData.settings,
                      requireSequentialCompletion: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="requireSequential" className="text-sm font-medium text-gray-700">
                  Require sequential completion
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableCertificate"
                  checked={bundleData.settings.certificateEnabled}
                  onChange={(e) => setBundleData({
                    ...bundleData,
                    settings: {
                      ...bundleData.settings,
                      certificateEnabled: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="enableCertificate" className="text-sm font-medium text-gray-700">
                  Enable bundle certificate
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="enableDiscussion"
                  checked={bundleData.settings.discussionEnabled}
                  onChange={(e) => setBundleData({
                    ...bundleData,
                    settings: {
                      ...bundleData.settings,
                      discussionEnabled: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="enableDiscussion" className="text-sm font-medium text-gray-700">
                  Enable discussions
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Actions */}
      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={() => handleSaveBundle(true)}
          loading={saving}
          className="w-full sm:w-auto"
        >
          <ApperIcon name="Save" className="h-4 w-4 mr-2" />
          Save as Draft
        </Button>
        <Button
          onClick={() => handleSaveBundle(false)}
          loading={saving}
          className="w-full sm:w-auto"
        >
          <ApperIcon name="Send" className="h-4 w-4 mr-2" />
          Publish Bundle
        </Button>
      </div>
    </div>
  )
}

export default CourseBundleBuilder