// Mock Activity Service
const mockActivities = [
  {
    Id: 1,
    type: "submission",
    title: "New homework submission",
    description: "David Thompson submitted homework for React Fundamentals - Lesson 3",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    icon: "FileText",
    status: "pending",
    user: { Id: 4, name: "David Thompson" },
    metadata: {}
  },
  {
    Id: 2,
    type: "login",
    title: "Student logged in",
    description: "Sarah Wilson accessed the learning platform",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    icon: "LogIn",
    status: "completed",
    user: { Id: 5, name: "Sarah Wilson" },
    metadata: {}
  },
  {
    Id: 3,
    type: "enrollment",
    title: "New student enrollment",
    description: "Alex Johnson enrolled in Advanced JavaScript Course",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    icon: "UserPlus",
    status: "completed",
    user: { Id: 6, name: "Alex Johnson" },
    metadata: {}
  },
  {
    Id: 4,
    type: "payment",
    title: "Payment received",
    description: "Course payment processed successfully",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    icon: "CreditCard",
    status: "completed",
    user: { Id: 7, name: "Maria Garcia" },
    metadata: { amount: "199.00" }
  }
]

export const activityService = {
  getRecentActivity: async (limit = 10) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockActivities.slice(0, limit)
  },

  getActivityStats: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      todaySubmissions: 3,
      todayLogins: 8,
      todayPayments: 2,
      todayEnrollments: 1
    }
  },

  getByType: async (type) => {
    await new Promise(resolve => setTimeout(resolve, 400))
    return mockActivities.filter(activity => activity.type === type)
  }
}