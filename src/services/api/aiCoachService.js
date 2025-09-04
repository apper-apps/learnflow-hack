import aiCoachesData from '@/services/mockData/aiCoaches.json'

// Local copy for mutations
let coaches = [...aiCoachesData]

// Utility function to simulate API delay
const delay = () => new Promise(resolve => setTimeout(resolve, 300))

export const aiCoachService = {
  // Get all AI coaches
  async getAll() {
    await delay()
    return [...coaches]
  },

  // Get AI coach by ID
  async getById(id) {
    await delay()
    const coach = coaches.find(c => c.Id === parseInt(id))
    if (!coach) {
      throw new Error("AI Coach not found")
    }
    return { ...coach }
  },

  // Create new AI coach
  async create(coachData) {
    await delay()
    const newCoach = {
      ...coachData,
      Id: Math.max(...coaches.map(c => c.Id), 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    coaches.push(newCoach)
    return { ...newCoach }
  },

  // Update AI coach
  async update(id, coachData) {
    await delay()
    const index = coaches.findIndex(c => c.Id === parseInt(id))
    if (index === -1) {
      throw new Error("AI Coach not found")
    }
    coaches[index] = { 
      ...coaches[index], 
      ...coachData, 
      updatedAt: new Date().toISOString() 
    }
    return { ...coaches[index] }
  },

  // Delete AI coach
  async delete(id) {
    await delay()
    const index = coaches.findIndex(c => c.Id === parseInt(id))
    if (index === -1) {
      throw new Error("AI Coach not found")
    }
    coaches.splice(index, 1)
    return { success: true }
  },

  // Get coaches by status
  async getByStatus(status) {
    await delay()
    return coaches.filter(c => c.status === status).map(c => ({ ...c }))
  }
}