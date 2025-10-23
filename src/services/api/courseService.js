const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 200))

// Initialize ApperClient
const { ApperClient } = window.ApperSDK
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
})

const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 200))

export const courseService = {
  async getAll() {
    await delay()
    try {
      const response = await apperClient.fetchRecords('course_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "course_url_c"}},
          {"field": {"Name": "pricing_type_c"}},
          {"field": {"Name": "pricing_currency_c"}},
          {"field": {"Name": "pricing_price_c"}},
          {"field": {"Name": "pricing_monthly_price_c"}},
          {"field": {"Name": "pricing_days_until_expiry_c"}},
          {"field": {"Name": "drip_schedule_enabled_c"}},
          {"field": {"Name": "drip_schedule_type_c"}},
          {"field": {"Name": "drip_schedule_specific_date_c"}},
          {"field": {"Name": "owner_id_c"}},
          {"field": {"Name": "ai_coach_id_c"}}
        ]
      })
      
      if (!response.success) {
        console.error("Error fetching courses:", response.message)
        return []
      }
      
      return response.data || []
    } catch (error) {
      console.error("Error fetching courses:", error?.message || error)
      return []
    }
  },

  async getById(id) {
    await delay()
    try {
      const response = await apperClient.getRecordById('course_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "course_url_c"}},
          {"field": {"Name": "pricing_type_c"}},
          {"field": {"Name": "pricing_currency_c"}},
          {"field": {"Name": "pricing_price_c"}},
          {"field": {"Name": "pricing_monthly_price_c"}},
          {"field": {"Name": "pricing_days_until_expiry_c"}},
          {"field": {"Name": "drip_schedule_enabled_c"}},
          {"field": {"Name": "drip_schedule_type_c"}},
          {"field": {"Name": "drip_schedule_specific_date_c"}},
          {"field": {"Name": "settings_banner_c"}},
          {"field": {"Name": "settings_colors_primary_c"}},
          {"field": {"Name": "settings_colors_secondary_c"}},
          {"field": {"Name": "settings_domain_enabled_c"}},
          {"field": {"Name": "settings_domain_custom_domain_c"}},
          {"field": {"Name": "settings_visibility_is_public_c"}},
          {"field": {"Name": "owner_id_c"}},
          {"field": {"Name": "ai_coach_id_c"}}
        ]
      })
      
      if (!response.success) {
        console.error("Error fetching course:", response.message)
        throw new Error("Course not found")
      }
      
      return response.data
    } catch (error) {
      console.error("Error fetching course:", error?.message || error)
      throw new Error("Course not found")
    }
  },

  async create(courseData) {
    await delay()
    try {
      const payload = {
        records: [{
          Name: courseData.title || courseData.Name || "Untitled Course",
          title_c: courseData.title || "",
          description_c: courseData.description || "",
          status_c: courseData.status || "draft",
          course_url_c: courseData.courseUrl || "",
          pricing_type_c: courseData.pricingType || courseData.pricing?.type || "free",
          pricing_currency_c: courseData.pricingCurrency || courseData.pricing?.currency || "USD",
          pricing_price_c: courseData.pricingPrice || courseData.pricing?.price || 0,
          pricing_monthly_price_c: courseData.pricingMonthlyPrice || courseData.pricing?.monthlyPrice || 0,
          pricing_days_until_expiry_c: courseData.pricingDaysUntilExpiry || courseData.pricing?.daysUntilExpiry || 0,
          drip_schedule_enabled_c: courseData.dripScheduleEnabled || courseData.dripSchedule?.enabled || false,
          drip_schedule_type_c: courseData.dripScheduleType || courseData.dripSchedule?.type || "enrollment",
          drip_schedule_specific_date_c: courseData.dripScheduleSpecificDate || courseData.dripSchedule?.specificDate || null,
          settings_banner_c: courseData.settingsBanner || courseData.settings?.banner || "",
          settings_colors_primary_c: courseData.settingsColorsPrimary || courseData.settings?.colors?.primary || "",
          settings_colors_secondary_c: courseData.settingsColorsSecondary || courseData.settings?.colors?.secondary || "",
          settings_domain_enabled_c: courseData.settingsDomainEnabled || courseData.settings?.domain?.enabled || false,
          settings_domain_custom_domain_c: courseData.settingsDomainCustomDomain || courseData.settings?.domain?.customDomain || "",
          settings_visibility_is_public_c: courseData.settingsVisibilityIsPublic || courseData.settings?.visibility?.isPublic || true,
          owner_id_c: courseData.ownerId || null,
          ai_coach_id_c: courseData.aiCoachId || null
        }]
      }
      
      const response = await apperClient.createRecord('course_c', payload)
      
      if (!response.success) {
        console.error("Error creating course:", response.message)
        throw new Error(response.message || "Failed to create course")
      }
      
      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        if (!result.success) {
          console.error("Error creating course:", result.message)
          throw new Error(result.message || "Failed to create course")
        }
        return result.data
      }
      
      return response.data
    } catch (error) {
      console.error("Error creating course:", error?.message || error)
      throw error
    }
  },

async update(id, courseData) {
    await delay()
    try {
      const payload = {
        records: [{
          Id: parseInt(id)
        }]
      }
      
      // Only include fields that are provided in courseData
      const record = payload.records[0]
      if (courseData.title !== undefined) record.title_c = courseData.title
      if (courseData.description !== undefined) record.description_c = courseData.description
      if (courseData.status !== undefined) record.status_c = courseData.status
      if (courseData.courseUrl !== undefined) record.course_url_c = courseData.courseUrl
      if (courseData.pricingType !== undefined) record.pricing_type_c = courseData.pricingType
      if (courseData.pricingCurrency !== undefined) record.pricing_currency_c = courseData.pricingCurrency
      if (courseData.pricingPrice !== undefined) record.pricing_price_c = courseData.pricingPrice
      if (courseData.pricingMonthlyPrice !== undefined) record.pricing_monthly_price_c = courseData.pricingMonthlyPrice
      if (courseData.pricingDaysUntilExpiry !== undefined) record.pricing_days_until_expiry_c = courseData.pricingDaysUntilExpiry
      if (courseData.dripScheduleEnabled !== undefined) record.drip_schedule_enabled_c = courseData.dripScheduleEnabled
      if (courseData.dripScheduleType !== undefined) record.drip_schedule_type_c = courseData.dripScheduleType
      if (courseData.dripScheduleSpecificDate !== undefined) record.drip_schedule_specific_date_c = courseData.dripScheduleSpecificDate
      if (courseData.ownerId !== undefined) record.owner_id_c = courseData.ownerId
      if (courseData.aiCoachId !== undefined) record.ai_coach_id_c = courseData.aiCoachId
      
      // Handle nested settings objects
      if (courseData.settings?.banner !== undefined) record.settings_banner_c = courseData.settings.banner
      if (courseData.settings?.colors?.primary !== undefined) record.settings_colors_primary_c = courseData.settings.colors.primary
      if (courseData.settings?.colors?.secondary !== undefined) record.settings_colors_secondary_c = courseData.settings.colors.secondary
      if (courseData.settings?.domain?.enabled !== undefined) record.settings_domain_enabled_c = courseData.settings.domain.enabled
      if (courseData.settings?.domain?.customDomain !== undefined) record.settings_domain_custom_domain_c = courseData.settings.domain.customDomain
      if (courseData.settings?.visibility?.isPublic !== undefined) record.settings_visibility_is_public_c = courseData.settings.visibility.isPublic
      
      const response = await apperClient.updateRecord('course_c', payload)
      
      if (!response.success) {
        console.error("Error updating course:", response.message)
        throw new Error(response.message || "Failed to update course")
      }
      
      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        if (!result.success) {
          console.error("Error updating course:", result.message)
          throw new Error(result.message || "Failed to update course")
        }
        return result.data
      }
      
      return response.data
    } catch (error) {
      console.error("Error updating course:", error?.message || error)
      throw error
    }
  },

async generateCourseUrl(id, courseTitle) {
    await delay()
    try {
      // Generate URL slug from course title
      const urlSlug = courseTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen

      // Update course with generated URL
      await this.update(id, { courseUrl: urlSlug })
      
      return urlSlug
    } catch (error) {
      console.error("Error generating course URL:", error?.message || error)
      throw error
    }
  },

async delete(id) {
    await delay()
    try {
      const response = await apperClient.deleteRecord('course_c', {
        RecordIds: [parseInt(id)]
      })
      
      if (!response.success) {
        console.error("Error deleting course:", response.message)
        throw new Error(response.message || "Failed to delete course")
      }
      
      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        if (!result.success) {
          console.error("Error deleting course:", result.message)
          throw new Error(result.message || "Failed to delete course")
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error("Error deleting course:", error?.message || error)
      throw error
    }
  },

async getCourseStructure(courseId) {
    await delay()
    try {
      const course = await this.getById(courseId)
      const courseModules = await moduleService.getByCourseId(courseId)
      
      // Load lessons for each module
      const modulesWithLessons = await Promise.all(
        courseModules.map(async (module) => {
          const moduleLessons = await lessonService.getByModuleId(module.Id)
          return {
            ...module,
            lessons: moduleLessons
          }
        })
      )
      
      return {
        ...course,
        modules: modulesWithLessons
      }
    } catch (error) {
      console.error("Error fetching course structure:", error?.message || error)
      throw error
    }
  }
}

export const moduleService = {
  async getAll() {
    await delay()
    try {
      const response = await apperClient.fetchRecords('module_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "order_index_c"}},
          {"field": {"Name": "course_id_c"}}
        ]
      })
      
      if (!response.success) {
        console.error("Error fetching modules:", response.message)
        return []
      }
      
      return response.data || []
    } catch (error) {
      console.error("Error fetching modules:", error?.message || error)
      return []
    }
  },

  async getByCourseId(courseId) {
    await delay()
    try {
      const response = await apperClient.fetchRecords('module_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "order_index_c"}},
          {"field": {"Name": "course_id_c"}}
        ],
        where: [
          {"FieldName": "course_id_c", "Operator": "EqualTo", "Values": [parseInt(courseId)]}
        ],
        orderBy: [{"fieldName": "order_index_c", "sorttype": "ASC"}]
      })
      
      if (!response.success) {
        console.error("Error fetching modules:", response.message)
        return []
      }
      
      return response.data || []
    } catch (error) {
      console.error("Error fetching modules:", error?.message || error)
      return []
    }
  },

  async create(moduleData) {
    await delay()
    try {
      const payload = {
        records: [{
          Name: moduleData.title || "Untitled Module",
          title_c: moduleData.title || "",
          description_c: moduleData.description || "",
          order_index_c: moduleData.orderIndex || 0,
          course_id_c: parseInt(moduleData.courseId)
        }]
      }
      
      const response = await apperClient.createRecord('module_c', payload)
      
      if (!response.success) {
        console.error("Error creating module:", response.message)
        throw new Error(response.message || "Failed to create module")
      }
      
      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        if (!result.success) {
          console.error("Error creating module:", result.message)
          throw new Error(result.message || "Failed to create module")
        }
        return result.data
      }
      
      return response.data
    } catch (error) {
      console.error("Error creating module:", error?.message || error)
      throw error
    }
  },

  async update(id, moduleData) {
    await delay()
    try {
      const payload = {
        records: [{
          Id: parseInt(id)
        }]
      }
      
      const record = payload.records[0]
      if (moduleData.title !== undefined) record.title_c = moduleData.title
      if (moduleData.description !== undefined) record.description_c = moduleData.description
      if (moduleData.orderIndex !== undefined) record.order_index_c = moduleData.orderIndex
      if (moduleData.courseId !== undefined) record.course_id_c = parseInt(moduleData.courseId)
      
      const response = await apperClient.updateRecord('module_c', payload)
      
      if (!response.success) {
        console.error("Error updating module:", response.message)
        throw new Error(response.message || "Failed to update module")
      }
      
      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        if (!result.success) {
          console.error("Error updating module:", result.message)
          throw new Error(result.message || "Failed to update module")
        }
        return result.data
      }
      
      return response.data
    } catch (error) {
      console.error("Error updating module:", error?.message || error)
      throw error
    }
  },

  async delete(id) {
    await delay()
    try {
      const response = await apperClient.deleteRecord('module_c', {
        RecordIds: [parseInt(id)]
      })
      
      if (!response.success) {
        console.error("Error deleting module:", response.message)
        throw new Error(response.message || "Failed to delete module")
      }
      
      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        if (!result.success) {
          console.error("Error deleting module:", result.message)
          throw new Error(result.message || "Failed to delete module")
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error("Error deleting module:", error?.message || error)
      throw error
    }
  }
}

export const lessonService = {
  async getAll() {
    await delay()
    try {
      const response = await apperClient.fetchRecords('lesson_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "order_index_c"}},
          {"field": {"Name": "duration_c"}},
          {"field": {"Name": "video_url_c"}},
          {"field": {"Name": "module_id_c"}}
        ]
      })
      
      if (!response.success) {
        console.error("Error fetching lessons:", response.message)
        return []
      }
      
      return response.data || []
    } catch (error) {
      console.error("Error fetching lessons:", error?.message || error)
      return []
    }
  },

  async getById(id) {
    await delay()
    try {
      const response = await apperClient.getRecordById('lesson_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "order_index_c"}},
          {"field": {"Name": "duration_c"}},
          {"field": {"Name": "video_url_c"}},
          {"field": {"Name": "resources_c"}},
          {"field": {"Name": "quiz_c"}},
          {"field": {"Name": "module_id_c"}}
        ]
      })
      
      if (!response.success) {
        console.error("Error fetching lesson:", response.message)
        throw new Error("Lesson not found")
      }
      
      return response.data
    } catch (error) {
      console.error("Error fetching lesson:", error?.message || error)
      throw new Error("Lesson not found")
    }
  },

  async getByModuleId(moduleId) {
    await delay()
    try {
      const response = await apperClient.fetchRecords('lesson_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "order_index_c"}},
          {"field": {"Name": "duration_c"}},
          {"field": {"Name": "video_url_c"}},
          {"field": {"Name": "module_id_c"}}
        ],
        where: [
          {"FieldName": "module_id_c", "Operator": "EqualTo", "Values": [parseInt(moduleId)]}
        ],
        orderBy: [{"fieldName": "order_index_c", "sorttype": "ASC"}]
      })
      
      if (!response.success) {
        console.error("Error fetching lessons:", response.message)
        return []
      }
      
      return response.data || []
    } catch (error) {
      console.error("Error fetching lessons:", error?.message || error)
      return []
    }
  },

  async create(lessonData) {
    await delay()
    try {
      const payload = {
        records: [{
          Name: lessonData.title || "Untitled Lesson",
          title_c: lessonData.title || "",
          content_c: lessonData.content || "",
          type_c: lessonData.type || "video",
          order_index_c: lessonData.orderIndex || 0,
          duration_c: lessonData.duration || 0,
          video_url_c: lessonData.videoUrl || "",
          resources_c: lessonData.resources ? JSON.stringify(lessonData.resources) : "[]",
          quiz_c: lessonData.quiz ? JSON.stringify(lessonData.quiz) : null,
          module_id_c: parseInt(lessonData.moduleId)
        }]
      }
      
      const response = await apperClient.createRecord('lesson_c', payload)
      
      if (!response.success) {
        console.error("Error creating lesson:", response.message)
        throw new Error(response.message || "Failed to create lesson")
      }
      
      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        if (!result.success) {
          console.error("Error creating lesson:", result.message)
          throw new Error(result.message || "Failed to create lesson")
        }
        return result.data
      }
      
      return response.data
    } catch (error) {
      console.error("Error creating lesson:", error?.message || error)
      throw error
    }
  },

  async update(id, lessonData) {
    await delay()
    try {
      const payload = {
        records: [{
          Id: parseInt(id)
        }]
      }
      
      const record = payload.records[0]
      if (lessonData.title !== undefined) record.title_c = lessonData.title
      if (lessonData.content !== undefined) record.content_c = lessonData.content
      if (lessonData.type !== undefined) record.type_c = lessonData.type
      if (lessonData.orderIndex !== undefined) record.order_index_c = lessonData.orderIndex
      if (lessonData.duration !== undefined) record.duration_c = lessonData.duration
      if (lessonData.videoUrl !== undefined) record.video_url_c = lessonData.videoUrl
      if (lessonData.resources !== undefined) record.resources_c = JSON.stringify(lessonData.resources)
      if (lessonData.quiz !== undefined) record.quiz_c = lessonData.quiz ? JSON.stringify(lessonData.quiz) : null
      if (lessonData.moduleId !== undefined) record.module_id_c = parseInt(lessonData.moduleId)
      
      const response = await apperClient.updateRecord('lesson_c', payload)
      
      if (!response.success) {
        console.error("Error updating lesson:", response.message)
        throw new Error(response.message || "Failed to update lesson")
      }
      
      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        if (!result.success) {
          console.error("Error updating lesson:", result.message)
          throw new Error(result.message || "Failed to update lesson")
        }
        return result.data
      }
      
      return response.data
    } catch (error) {
      console.error("Error updating lesson:", error?.message || error)
      throw error
    }
  },

  async delete(id) {
    await delay()
    try {
      const response = await apperClient.deleteRecord('lesson_c', {
        RecordIds: [parseInt(id)]
      })
      
      if (!response.success) {
        console.error("Error deleting lesson:", response.message)
        throw new Error(response.message || "Failed to delete lesson")
      }
      
      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        if (!result.success) {
          console.error("Error deleting lesson:", result.message)
          throw new Error(result.message || "Failed to delete lesson")
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error("Error deleting lesson:", error?.message || error)
      throw error
    }
  }
}