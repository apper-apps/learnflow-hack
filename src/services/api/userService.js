const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200))

// Initialize ApperClient
const { ApperClient } = window.ApperSDK
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
})

// Helper function to generate realistic recent login dates
function getRandomRecentDate() {
  const now = new Date()
  const daysAgo = Math.floor(Math.random() * 7)
  const hoursAgo = Math.floor(Math.random() * 24)
  const minutesAgo = Math.floor(Math.random() * 60)
  
  const date = new Date(now - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000))
  return date.toISOString()
}

export const userService = {
  async getAll() {
    await delay()
    try {
      const response = await apperClient.fetchRecords('user_profile_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "role_c"}},
          {"field": {"Name": "avatar_c"}},
          {"field": {"Name": "last_login_at_c"}},
          {"field": {"Name": "Tags"}}
        ]
      })
      
      if (!response.success) {
        console.error("Error fetching users:", response.message)
        return []
      }
      
      return (response.data || []).map(user => ({
        ...user,
        lastLoginAt: user.last_login_at_c || getRandomRecentDate()
      }))
    } catch (error) {
      console.error("Error fetching users:", error?.message || error)
      return []
    }
  },

  async getRecentLogins(limit = 5) {
    await delay()
    try {
      const response = await apperClient.fetchRecords('user_profile_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "role_c"}},
          {"field": {"Name": "avatar_c"}},
          {"field": {"Name": "last_login_at_c"}}
        ],
        orderBy: [{"fieldName": "last_login_at_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": limit, "offset": 0}
      })
      
      if (!response.success) {
        console.error("Error fetching recent logins:", response.message)
        return []
      }
      
      return (response.data || []).map(user => ({
        ...user,
        lastLoginAt: user.last_login_at_c || getRandomRecentDate()
      }))
    } catch (error) {
      console.error("Error fetching recent logins:", error?.message || error)
      return []
    }
  },

  async getById(id) {
    await delay()
    try {
      const response = await apperClient.getRecordById('user_profile_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "role_c"}},
          {"field": {"Name": "avatar_c"}},
          {"field": {"Name": "last_login_at_c"}},
          {"field": {"Name": "Tags"}}
        ]
      })
      
      if (!response.success) {
        console.error("Error fetching user:", response.message)
        throw new Error("User not found")
      }
      
      return response.data
    } catch (error) {
      console.error("Error fetching user:", error?.message || error)
      throw new Error("User not found")
    }
  },

  async create(userData) {
    await delay()
    try {
      const payload = {
        records: [{
          Name: userData.name || "",
          name_c: userData.name || "",
          email_c: userData.email || "",
          role_c: userData.role || "student",
          avatar_c: userData.avatar || "",
          last_login_at_c: userData.lastLoginAt || null
        }]
      }
      
      const response = await apperClient.createRecord('user_profile_c', payload)
      
      if (!response.success) {
        console.error("Error creating user:", response.message)
        throw new Error(response.message || "Failed to create user")
      }
      
      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        if (!result.success) {
          console.error("Error creating user:", result.message)
          throw new Error(result.message || "Failed to create user")
        }
        return result.data
      }
      
      return response.data
    } catch (error) {
      console.error("Error creating user:", error?.message || error)
      throw error
    }
  },

  async update(id, userData) {
    await delay()
    try {
      const payload = {
        records: [{
          Id: parseInt(id)
        }]
      }
      
      const record = payload.records[0]
      if (userData.name !== undefined) record.name_c = userData.name
      if (userData.email !== undefined) record.email_c = userData.email
      if (userData.role !== undefined) record.role_c = userData.role
      if (userData.avatar !== undefined) record.avatar_c = userData.avatar
      if (userData.lastLoginAt !== undefined) record.last_login_at_c = userData.lastLoginAt
      
      const response = await apperClient.updateRecord('user_profile_c', payload)
      
      if (!response.success) {
        console.error("Error updating user:", response.message)
        throw new Error(response.message || "Failed to update user")
      }
      
      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        if (!result.success) {
          console.error("Error updating user:", result.message)
          throw new Error(result.message || "Failed to update user")
        }
        return result.data
      }
      
      return response.data
    } catch (error) {
      console.error("Error updating user:", error?.message || error)
      throw error
    }
  },

  async delete(id) {
    await delay()
    try {
      const response = await apperClient.deleteRecord('user_profile_c', {
        RecordIds: [parseInt(id)]
      })
      
      if (!response.success) {
        console.error("Error deleting user:", response.message)
        throw new Error(response.message || "Failed to delete user")
      }
      
      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        if (!result.success) {
          console.error("Error deleting user:", result.message)
          throw new Error(result.message || "Failed to delete user")
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error("Error deleting user:", error?.message || error)
      throw error
    }
  },

  async getByRole(role) {
    await delay()
    try {
      const response = await apperClient.fetchRecords('user_profile_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "role_c"}},
          {"field": {"Name": "avatar_c"}},
          {"field": {"Name": "last_login_at_c"}}
        ],
        where: [
          {"FieldName": "role_c", "Operator": "EqualTo", "Values": [role]}
        ]
      })
      
      if (!response.success) {
        console.error("Error fetching users by role:", response.message)
        return []
      }
      
      return (response.data || []).map(user => ({
        ...user,
        lastLoginAt: user.last_login_at_c || getRandomRecentDate()
      }))
    } catch (error) {
      console.error("Error fetching users by role:", error?.message || error)
      return []
    }
  }
}