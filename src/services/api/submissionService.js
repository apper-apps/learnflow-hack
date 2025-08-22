import submissionsData from "@/services/mockData/submissions.json"
import commentsData from "@/services/mockData/comments.json"
import tasksData from "@/services/mockData/tasks.json"

let submissions = [...submissionsData]
let comments = [...commentsData]
let tasks = [...tasksData]

const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 200))

export const submissionService = {
  async getAll() {
    await delay()
    return [...submissions]
  },

  async getById(id) {
    await delay()
    const submission = submissions.find(s => s.Id === parseInt(id))
    if (!submission) {
      throw new Error("Submission not found")
    }
    return { ...submission }
  },

  async getByStudentId(studentId) {
    await delay()
    return submissions
      .filter(s => s.studentId === parseInt(studentId))
      .map(s => ({ ...s }))
  },

  async getByStatus(status) {
    await delay()
    return submissions
      .filter(s => s.status === status)
      .map(s => ({ ...s }))
  },

  async create(submissionData) {
    await delay()
    const newSubmission = {
      Id: Math.max(...submissions.map(s => s.Id)) + 1,
      ...submissionData,
      status: "pending",
      submittedAt: new Date().toISOString()
    }
    submissions.push(newSubmission)
    
    // Create a task for the coach
    const newTask = {
      Id: Math.max(...tasks.map(t => t.Id)) + 1,
      submissionId: newSubmission.Id,
      coachId: 2, // Default coach for demo
      status: "pending",
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours from now
      priority: "medium"
    }
    tasks.push(newTask)
    
    return { ...newSubmission }
  },

  async update(id, submissionData) {
    await delay()
    const index = submissions.findIndex(s => s.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Submission not found")
    }
    submissions[index] = { ...submissions[index], ...submissionData }
    
    // Update task status if submission is approved
    if (submissionData.status === "approved") {
      const taskIndex = tasks.findIndex(t => t.submissionId === parseInt(id))
      if (taskIndex !== -1) {
        tasks[taskIndex].status = "completed"
      }
    }
    
    return { ...submissions[index] }
  },

  async delete(id) {
    await delay()
    const index = submissions.findIndex(s => s.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Submission not found")
    }
    const deletedSubmission = submissions.splice(index, 1)[0]
    return { ...deletedSubmission }
  }
}

export const commentService = {
  async getBySubmissionId(submissionId) {
    await delay()
    return comments
      .filter(c => c.submissionId === parseInt(submissionId))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(c => ({ ...c }))
  },

  async create(commentData) {
    await delay()
    const newComment = {
      Id: Math.max(...comments.map(c => c.Id)) + 1,
      ...commentData,
      createdAt: new Date().toISOString()
    }
    comments.push(newComment)
    return { ...newComment }
  },

  async delete(id) {
    await delay()
    const index = comments.findIndex(c => c.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Comment not found")
    }
    const deletedComment = comments.splice(index, 1)[0]
    return { ...deletedComment }
  }
}

export const taskService = {
  async getAll() {
    await delay()
    return [...tasks]
  },

  async getByCoachId(coachId) {
    await delay()
    return tasks
      .filter(t => t.coachId === parseInt(coachId))
      .map(t => ({ ...t }))
  },

  async getByStatus(status) {
    await delay()
    return tasks
      .filter(t => t.status === status)
      .map(t => ({ ...t }))
  },

  async update(id, taskData) {
    await delay()
    const index = tasks.findIndex(t => t.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Task not found")
    }
    tasks[index] = { ...tasks[index], ...taskData }
    return { ...tasks[index] }
  }
}