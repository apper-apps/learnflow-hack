import React from "react";
import Error from "@/components/ui/Error";
const delay = () => new Promise(resolve => setTimeout(resolve, 300))

// Initialize ApperClient
const { ApperClient } = window.ApperSDK
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
})

export const bundleService = {
  async getAll() {
    await delay()
    try {
      const response = await apperClient.fetchRecords('bundle_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "courses_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "pricing_type_c"}},
          {"field": {"Name": "pricing_currency_c"}},
          {"field": {"Name": "pricing_price_c"}},
          {"field": {"Name": "ai_coach_id_c"}}
        ]
      })
      
      if (!response.success) {
        console.error("Error fetching bundles:", response.message)
        return []
      }
      
      // Parse courses JSON string back to array
      const bundles = (response.data || []).map(bundle => ({
        ...bundle,
        courses: bundle.courses_c ? JSON.parse(bundle.courses_c) : []
      }))
      
      return bundles
    } catch (error) {
      console.error("Error fetching bundles:", error?.message || error)
      return []
    }
  },

  async getById(id) {
    await delay()
    try {
      const response = await apperClient.getRecordById('bundle_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "courses_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "pricing_type_c"}},
          {"field": {"Name": "pricing_currency_c"}},
          {"field": {"Name": "pricing_price_c"}},
          {"field": {"Name": "pricing_monthly_price_c"}},
          {"field": {"Name": "pricing_days_until_expiry_c"}},
          {"field": {"Name": "drip_schedule_enabled_c"}},
          {"field": {"Name": "drip_schedule_type_c"}},
          {"field": {"Name": "drip_schedule_specific_date_c"}},
          {"field": {"Name": "settings_allow_course_skipping_c"}},
          {"field": {"Name": "settings_require_sequential_completion_c"}},
          {"field": {"Name": "ai_coach_id_c"}}
        ]
      })
      
      if (!response.success) {
        console.error("Error fetching bundle:", response.message)
        throw new Error(`Bundle with ID ${id} not found`)
      }
      
      // Parse courses JSON string back to array
      const bundle = {
        ...response.data,
        courses: response.data.courses_c ? JSON.parse(response.data.courses_c) : []
      }
      
      return bundle
    } catch (error) {
      console.error("Error fetching bundle:", error?.message || error)
      throw new Error(`Bundle with ID ${id} not found`)
    }
  },

  async create(bundleData) {
    await delay()
    try {
      const payload = {
        records: [{
          Name: bundleData.title || "Untitled Bundle",
          title_c: bundleData.title || "",
          description_c: bundleData.description || "",
          courses_c: JSON.stringify(bundleData.courses || []),
          status_c: bundleData.status || "draft",
          pricing_type_c: bundleData.pricingType || bundleData.pricing?.type || "free",
          pricing_currency_c: bundleData.pricingCurrency || bundleData.pricing?.currency || "USD",
          pricing_price_c: bundleData.pricingPrice || bundleData.pricing?.price || 0,
          pricing_monthly_price_c: bundleData.pricingMonthlyPrice || bundleData.pricing?.monthlyPrice || 0,
          pricing_days_until_expiry_c: bundleData.pricingDaysUntilExpiry || bundleData.pricing?.daysUntilExpiry || 0,
          drip_schedule_enabled_c: bundleData.dripScheduleEnabled || bundleData.dripSchedule?.enabled || false,
          drip_schedule_type_c: bundleData.dripScheduleType || bundleData.dripSchedule?.type || "enrollment",
          drip_schedule_specific_date_c: bundleData.dripScheduleSpecificDate || bundleData.dripSchedule?.specificDate || null,
          settings_allow_course_skipping_c: bundleData.settingsAllowCourseSkipping || bundleData.settings?.allowCourseSkipping || false,
          settings_require_sequential_completion_c: bundleData.settingsRequireSequentialCompletion || bundleData.settings?.requireSequentialCompletion || false,
          ai_coach_id_c: bundleData.aiCoachId || null
        }]
      }
      
      const response = await apperClient.createRecord('bundle_c', payload)
      
      if (!response.success) {
        console.error("Error creating bundle:", response.message)
        throw new Error(response.message || "Failed to create bundle")
      }
      
      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        if (!result.success) {
          console.error("Error creating bundle:", result.message)
          throw new Error(result.message || "Failed to create bundle")
        }
        
        // Parse courses back to array
        const bundle = {
          ...result.data,
          courses: result.data.courses_c ? JSON.parse(result.data.courses_c) : []
        }
        return bundle
      }
      
      return response.data
    } catch (error) {
      console.error("Error creating bundle:", error?.message || error)
      throw error
    }
  },

  async update(id, bundleData) {
    await delay()
    try {
      const payload = {
        records: [{
          Id: parseInt(id)
        }]
      }
      
      const record = payload.records[0]
      if (bundleData.title !== undefined) record.title_c = bundleData.title
      if (bundleData.description !== undefined) record.description_c = bundleData.description
      if (bundleData.courses !== undefined) record.courses_c = JSON.stringify(bundleData.courses)
      if (bundleData.status !== undefined) record.status_c = bundleData.status
      if (bundleData.pricingType !== undefined) record.pricing_type_c = bundleData.pricingType
      if (bundleData.pricingCurrency !== undefined) record.pricing_currency_c = bundleData.pricingCurrency
      if (bundleData.pricingPrice !== undefined) record.pricing_price_c = bundleData.pricingPrice
      if (bundleData.pricingMonthlyPrice !== undefined) record.pricing_monthly_price_c = bundleData.pricingMonthlyPrice
      if (bundleData.pricingDaysUntilExpiry !== undefined) record.pricing_days_until_expiry_c = bundleData.pricingDaysUntilExpiry
      if (bundleData.dripScheduleEnabled !== undefined) record.drip_schedule_enabled_c = bundleData.dripScheduleEnabled
      if (bundleData.dripScheduleType !== undefined) record.drip_schedule_type_c = bundleData.dripScheduleType
      if (bundleData.dripScheduleSpecificDate !== undefined) record.drip_schedule_specific_date_c = bundleData.dripScheduleSpecificDate
      if (bundleData.aiCoachId !== undefined) record.ai_coach_id_c = bundleData.aiCoachId
      
      const response = await apperClient.updateRecord('bundle_c', payload)
      
      if (!response.success) {
        console.error("Error updating bundle:", response.message)
        throw new Error(response.message || "Failed to update bundle")
      }
      
      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        if (!result.success) {
          console.error("Error updating bundle:", result.message)
          throw new Error(result.message || "Failed to update bundle")
        }
        
        // Parse courses back to array
        const bundle = {
          ...result.data,
          courses: result.data.courses_c ? JSON.parse(result.data.courses_c) : []
        }
        return bundle
      }
      
      return response.data
    } catch (error) {
      console.error("Error updating bundle:", error?.message || error)
      throw error
    }
  },

  async delete(id) {
    await delay()
    try {
      const response = await apperClient.deleteRecord('bundle_c', {
        RecordIds: [parseInt(id)]
      })
      
      if (!response.success) {
        console.error("Error deleting bundle:", response.message)
        throw new Error(response.message || "Failed to delete bundle")
      }
      
      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        if (!result.success) {
          console.error("Error deleting bundle:", result.message)
          throw new Error(result.message || "Failed to delete bundle")
        }
      }
      
      return true
    } catch (error) {
      console.error("Error deleting bundle:", error?.message || error)
      throw error
    }
  },

  async duplicateBundle(id, newTitle) {
    await delay()
    try {
      const originalBundle = await this.getById(id)
      
      const duplicatedData = {
        title: newTitle || `${originalBundle.title_c || originalBundle.title} (Copy)`,
        description: originalBundle.description_c || originalBundle.description,
        courses: originalBundle.courses,
        status: 'draft',
        pricingType: originalBundle.pricing_type_c,
        pricingCurrency: originalBundle.pricing_currency_c,
        pricingPrice: originalBundle.pricing_price_c,
        pricingMonthlyPrice: originalBundle.pricing_monthly_price_c,
        pricingDaysUntilExpiry: originalBundle.pricing_days_until_expiry_c,
        dripScheduleEnabled: originalBundle.drip_schedule_enabled_c,
        dripScheduleType: originalBundle.drip_schedule_type_c,
        dripScheduleSpecificDate: originalBundle.drip_schedule_specific_date_c,
        aiCoachId: originalBundle.ai_coach_id_c
      }
      
      return await this.create(duplicatedData)
    } catch (error) {
      console.error("Error duplicating bundle:", error?.message || error)
      throw error
}
  }
}