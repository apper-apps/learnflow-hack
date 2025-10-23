const delay = () => new Promise(resolve => setTimeout(resolve, 300))

// Initialize ApperClient
const { ApperClient } = window.ApperSDK
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
})

// Utility function to simulate API delay
const delay = () => new Promise(resolve => setTimeout(resolve, 300))

export const aiCoachService = {
  // Get all AI coaches
  async getAll() {
    await delay()
    try {
      const response = await apperClient.fetchRecords('ai_coach_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "prompt_c"}},
          {"field": {"Name": "instructions_c"}},
          {"field": {"Name": "knowledge_base_c"}},
          {"field": {"Name": "status_c"}}
        ]
      })
      
      if (!response.success) {
        console.error("Error fetching AI coaches:", response.message)
        return []
      }
      
      // Parse knowledge base JSON string back to array
      const coaches = (response.data || []).map(coach => ({
        ...coach,
        knowledgeBase: coach.knowledge_base_c ? JSON.parse(coach.knowledge_base_c) : []
      }))
      
      return coaches
    } catch (error) {
      console.error("Error fetching AI coaches:", error?.message || error)
      return []
    }
  },

  // Get AI coach by ID
  async getById(id) {
    await delay()
    try {
      const response = await apperClient.getRecordById('ai_coach_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "prompt_c"}},
          {"field": {"Name": "instructions_c"}},
          {"field": {"Name": "knowledge_base_c"}},
          {"field": {"Name": "status_c"}}
        ]
      })
      
      if (!response.success) {
        console.error("Error fetching AI coach:", response.message)
        throw new Error("AI Coach not found")
      }
      
      // Parse knowledge base JSON string back to array
      const coach = {
        ...response.data,
        knowledgeBase: response.data.knowledge_base_c ? JSON.parse(response.data.knowledge_base_c) : []
      }
      
      return coach
    } catch (error) {
      console.error("Error fetching AI coach:", error?.message || error)
      throw new Error("AI Coach not found")
    }
  },

  // Create new AI coach
  async create(coachData) {
    await delay()
    try {
      const payload = {
        records: [{
          Name: coachData.name || "Untitled Coach",
          name_c: coachData.name || "",
          description_c: coachData.description || "",
          prompt_c: coachData.prompt || "",
          instructions_c: coachData.instructions || "",
          knowledge_base_c: JSON.stringify(coachData.knowledgeBase || []),
          status_c: coachData.status || "draft"
        }]
      }
      
      const response = await apperClient.createRecord('ai_coach_c', payload)
      
      if (!response.success) {
        console.error("Error creating AI coach:", response.message)
        throw new Error(response.message || "Failed to create AI coach")
      }
      
      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        if (!result.success) {
          console.error("Error creating AI coach:", result.message)
          throw new Error(result.message || "Failed to create AI coach")
        }
        
        // Parse knowledge base back to array
        const coach = {
          ...result.data,
          knowledgeBase: result.data.knowledge_base_c ? JSON.parse(result.data.knowledge_base_c) : []
        }
        return coach
      }
      
      return response.data
    } catch (error) {
      console.error("Error creating AI coach:", error?.message || error)
      throw error
    }
  },

  // Update AI coach
  async update(id, coachData) {
    await delay()
    try {
      const payload = {
        records: [{
          Id: parseInt(id)
        }]
      }
      
      const record = payload.records[0]
      if (coachData.name !== undefined) record.name_c = coachData.name
      if (coachData.description !== undefined) record.description_c = coachData.description
      if (coachData.prompt !== undefined) record.prompt_c = coachData.prompt
      if (coachData.instructions !== undefined) record.instructions_c = coachData.instructions
      if (coachData.knowledgeBase !== undefined) record.knowledge_base_c = JSON.stringify(coachData.knowledgeBase)
      if (coachData.status !== undefined) record.status_c = coachData.status
      
      const response = await apperClient.updateRecord('ai_coach_c', payload)
      
      if (!response.success) {
        console.error("Error updating AI coach:", response.message)
        throw new Error(response.message || "Failed to update AI coach")
      }
      
      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        if (!result.success) {
          console.error("Error updating AI coach:", result.message)
          throw new Error(result.message || "Failed to update AI coach")
        }
        
        // Parse knowledge base back to array
        const coach = {
          ...result.data,
          knowledgeBase: result.data.knowledge_base_c ? JSON.parse(result.data.knowledge_base_c) : []
        }
        return coach
      }
      
      return response.data
    } catch (error) {
      console.error("Error updating AI coach:", error?.message || error)
      throw error
    }
  },

  // Delete AI coach
  async delete(id) {
    await delay()
    try {
      const response = await apperClient.deleteRecord('ai_coach_c', {
        RecordIds: [parseInt(id)]
      })
      
      if (!response.success) {
        console.error("Error deleting AI coach:", response.message)
        throw new Error(response.message || "Failed to delete AI coach")
      }
      
      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        if (!result.success) {
          console.error("Error deleting AI coach:", result.message)
          throw new Error(result.message || "Failed to delete AI coach")
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error("Error deleting AI coach:", error?.message || error)
      throw error
    }
  },

  // Get coaches by status
  async getByStatus(status) {
    await delay()
    try {
      const response = await apperClient.fetchRecords('ai_coach_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "prompt_c"}},
          {"field": {"Name": "instructions_c"}},
          {"field": {"Name": "knowledge_base_c"}},
          {"field": {"Name": "status_c"}}
        ],
        where: [
          {"FieldName": "status_c", "Operator": "EqualTo", "Values": [status]}
        ]
      })
      
      if (!response.success) {
        console.error("Error fetching AI coaches by status:", response.message)
        return []
      }
      
      // Parse knowledge base JSON string back to array
      const coaches = (response.data || []).map(coach => ({
        ...coach,
        knowledgeBase: coach.knowledge_base_c ? JSON.parse(coach.knowledge_base_c) : []
      }))
      
      return coaches
    } catch (error) {
      console.error("Error fetching AI coaches by status:", error?.message || error)
      return []
    }
  }
}