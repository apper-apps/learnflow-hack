import enrollmentsData from "@/services/mockData/enrollments.json"

let enrollments = [...enrollmentsData]

const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200))

export const enrollmentService = {
  async getAll() {
    await delay()
    return [...enrollments]
  },

  async getRecent(limit = 5) {
    await delay()
    return [...enrollments]
      .sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt))
      .slice(0, limit)
  },

  async getByUserId(userId) {
    await delay()
    return enrollments
      .filter(e => e.userId === parseInt(userId))
      .map(e => ({ ...e }))
  },

  async getByCourseId(courseId) {
    await delay()
    return enrollments
      .filter(e => e.courseId === parseInt(courseId))
      .map(e => ({ ...e }))
  },

  async create(enrollmentData) {
    await delay()
    const newEnrollment = {
      Id: Math.max(...enrollments.map(e => e.Id)) + 1,
      ...enrollmentData,
      progress: {
        completedLessons: [],
        currentLesson: null,
        overallProgress: 0
      },
      enrolledAt: new Date().toISOString()
    }
    enrollments.push(newEnrollment)
    return { ...newEnrollment }
  },

  async updateProgress(userId, courseId, progressData) {
    await delay()
    const index = enrollments.findIndex(e => 
      e.userId === parseInt(userId) && e.courseId === parseInt(courseId)
    )
    if (index === -1) {
      throw new Error("Enrollment not found")
    }
    enrollments[index].progress = { ...enrollments[index].progress, ...progressData }
    return { ...enrollments[index] }
  },

  async delete(id) {
    await delay()
    const index = enrollments.findIndex(e => e.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Enrollment not found")
    }
    const deletedEnrollment = enrollments.splice(index, 1)[0]
    return { ...deletedEnrollment }
  }
}