import { submissionService } from "./submissionService"
import { userService } from "./userService"
import { enrollmentService } from "./enrollmentService"

// Mock payment data - in real app this would come from a payment service
const mockPayments = [
  {
    Id: 1,
    userId: 3,
    amount: 299.99,
    status: "completed",
    description: "Course Enrollment - Advanced React",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    Id: 2,
    userId: 4,
    amount: 199.99,
    status: "completed", 
    description: "Course Enrollment - JavaScript Fundamentals",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
  },
  {
    Id: 3,
    userId: 5,
    amount: 399.99,
    status: "completed",
    description: "Premium Coaching Package",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  }
]

const delay = () => new Promise(resolve => setTimeout(resolve, 300))

export const activityService = {
  async getRecentActivity(limit = 10) {
    await delay()
    
    try {
      // Get recent data from all services
      const [submissions, users, enrollments] = await Promise.all([
        submissionService.getAll(),
        userService.getAll(),
        enrollmentService.getAll()
      ])

      const activities = []

      // Add recent submissions (last 7 days)
      const recentSubmissions = submissions
        .filter(s => {
          const submissionDate = new Date(s.submittedAt)
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          return submissionDate > sevenDaysAgo
        })
        .slice(0, 5)

      recentSubmissions.forEach(submission => {
        const user = users.find(u => u.Id === submission.studentId)
        activities.push({
          Id: `submission-${submission.Id}`,
          type: "submission",
          icon: "FileText",
          title: "New submission received",
          description: `${user?.name || 'Unknown User'} submitted work for lesson ${submission.lessonId}`,
          user: user,
          timestamp: submission.submittedAt,
          status: submission.status,
          metadata: { submissionId: submission.Id }
        })
      })

      // Add recent logins (mock data - in real app this would come from auth logs)
      const recentLogins = users
        .filter(u => u.lastLoginAt)
        .sort((a, b) => new Date(b.lastLoginAt) - new Date(a.lastLoginAt))
        .slice(0, 5)

      recentLogins.forEach(user => {
        const loginDate = new Date(user.lastLoginAt)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        
        if (loginDate > oneDayAgo) {
          activities.push({
            Id: `login-${user.Id}`,
            type: "login",
            icon: "LogIn",
            title: "User logged in",
            description: `${user.name} signed in to the platform`,
            user: user,
            timestamp: user.lastLoginAt,
            status: "active",
            metadata: { userId: user.Id }
          })
        }
      })

      // Add recent payments
      mockPayments.forEach(payment => {
        const user = users.find(u => u.Id === payment.userId)
        const paymentDate = new Date(payment.createdAt)
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        
        if (paymentDate > threeDaysAgo) {
          activities.push({
            Id: `payment-${payment.Id}`,
            type: "payment",
            icon: "CreditCard",
            title: "Payment received",
            description: `${user?.name || 'Unknown User'} made a payment of $${payment.amount}`,
            user: user,
            timestamp: payment.createdAt,
            status: payment.status,
            metadata: { paymentId: payment.Id, amount: payment.amount }
          })
        }
      })

      // Add new members (recent enrollments)
      const recentEnrollments = enrollments
        .filter(e => {
          const enrollmentDate = new Date(e.enrolledAt)
          const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          return enrollmentDate > threeDaysAgo
        })
        .slice(0, 5)

      recentEnrollments.forEach(enrollment => {
        const user = users.find(u => u.Id === enrollment.userId)
        activities.push({
          Id: `enrollment-${enrollment.Id}`,
          type: "enrollment",
          icon: "UserPlus",
          title: "New member joined",
          description: `${user?.name || 'Unknown User'} enrolled in a course`,
          user: user,
          timestamp: enrollment.enrolledAt,
          status: "active",
          metadata: { enrollmentId: enrollment.Id, courseId: enrollment.courseId }
        })
      })

      // Sort all activities by timestamp (most recent first) and limit
      return activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit)

    } catch (error) {
      console.error("Failed to load recent activity:", error)
      return []
    }
  },

  async getActivityStats() {
    await delay()
    
    try {
      const [submissions, users, enrollments] = await Promise.all([
        submissionService.getAll(),
        userService.getAll(), 
        enrollmentService.getAll()
      ])

      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      return {
        todaySubmissions: submissions.filter(s => new Date(s.submittedAt) > oneDayAgo).length,
        todayLogins: users.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) > oneDayAgo).length,
        todayPayments: mockPayments.filter(p => new Date(p.createdAt) > oneDayAgo).length,
        todayEnrollments: enrollments.filter(e => new Date(e.enrolledAt) > oneDayAgo).length,
        weekSubmissions: submissions.filter(s => new Date(s.submittedAt) > oneWeekAgo).length,
        weekLogins: users.filter(u => u.lastLoginAt && new Date(u.lastLoginAt) > oneWeekAgo).length,
        weekPayments: mockPayments.filter(p => new Date(p.createdAt) > oneWeekAgo).length,
        weekEnrollments: enrollments.filter(e => new Date(e.enrolledAt) > oneWeekAgo).length
      }
    } catch (error) {
      console.error("Failed to load activity stats:", error)
      return {
        todaySubmissions: 0,
        todayLogins: 0,
        todayPayments: 0,
        todayEnrollments: 0,
        weekSubmissions: 0,
        weekLogins: 0,
        weekPayments: 0,
        weekEnrollments: 0
      }
    }
  }
}