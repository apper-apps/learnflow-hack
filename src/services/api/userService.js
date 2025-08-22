import usersData from "@/services/mockData/users.json"

let users = [...usersData]

const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200))

export const userService = {
  async getAll() {
    await delay()
    return [...users]
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
    return users.filter(u => u.role === role).map(u => ({ ...u }))
  }
}