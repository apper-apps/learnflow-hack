import usersData from "@/services/mockData/users.json"

let users = [...usersData]

const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200))

// Add last login timestamps to mock users for activity tracking
users.forEach(user => {
  if (!user.lastLoginAt) {
    // Add mock login times within the last 24 hours for some users
    const randomHoursAgo = Math.floor(Math.random() * 24)
    user.lastLoginAt = new Date(Date.now() - randomHoursAgo * 60 * 60 * 1000).toISOString()
  }
})

export const userService = {
  async getAll() {
    await delay()
    return [...users].map(user => ({
      ...user,
      lastLoginAt: user.lastLoginAt || getRandomRecentDate()
    }))
  },

  async getRecentLogins(limit = 5) {
    await delay()
    return [...users]
      .map(user => ({
        ...user,
        lastLoginAt: user.lastLoginAt || getRandomRecentDate()
      }))
      .filter(u => u.lastLoginAt)
      .sort((a, b) => new Date(b.lastLoginAt) - new Date(a.lastLoginAt))
      .slice(0, limit)
  },

  async getById(id) {
    await delay()
    const user = users.find(u => u.Id === parseInt(id))
    if (!user) {
      throw new Error("User not found")
    }
    return { ...user }
  },

  async create(userData) {
    await delay()
    const newUser = {
      Id: Math.max(...users.map(u => u.Id)) + 1,
      ...userData,
      createdAt: new Date().toISOString()
    }
    users.push(newUser)
    return { ...newUser }
  },

  async update(id, userData) {
    await delay()
    const index = users.findIndex(u => u.Id === parseInt(id))
    if (index === -1) {
      throw new Error("User not found")
    }
    users[index] = { ...users[index], ...userData }
    return { ...users[index] }
  },

  async delete(id) {
    await delay()
    const index = users.findIndex(u => u.Id === parseInt(id))
    if (index === -1) {
      throw new Error("User not found")
    }
    const deletedUser = users.splice(index, 1)[0]
    return { ...deletedUser }
  },

async getByRole(role) {
    await delay()
    return users.filter(u => u.role === role).map(u => ({
      ...u,
      lastLoginAt: u.lastLoginAt || getRandomRecentDate()
    }))
  }
}

// Helper function to generate realistic recent login dates
function getRandomRecentDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 7); // Within last 7 days
  const hoursAgo = Math.floor(Math.random() * 24); // Random hour
  const minutesAgo = Math.floor(Math.random() * 60); // Random minute
  
  const date = new Date(now - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));
  return date.toISOString();
}