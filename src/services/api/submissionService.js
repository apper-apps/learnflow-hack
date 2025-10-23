import commentsData from "@/services/mockData/comments.json"
import tasksData from "@/services/mockData/tasks.json"
import searchQueriesData from "@/services/mockData/searchQueries.json"

let comments = [...commentsData]
let tasks = [...tasksData]
let searchQueries = [...searchQueriesData]

const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 200))

// Initialize ApperClient
const { ApperClient } = window.ApperSDK
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
})

const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 200))

export const submissionService = {
  async getAll() {
    await delay()
    try {
      const response = await apperClient.fetchRecords('submission_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "files_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "submitted_at_c"}},
          {"field": {"Name": "lesson_id_c"}},
          {"field": {"Name": "student_id_c"}}
        ]
      })
      
      if (!response.success) {
        console.error("Error fetching submissions:", response.message)
        return []
      }
      
      // Parse files JSON string back to array
      const submissions = (response.data || []).map(submission => ({
        ...submission,
        files: submission.files_c ? JSON.parse(submission.files_c) : []
      }))
      
      return submissions
    } catch (error) {
      console.error("Error fetching submissions:", error?.message || error)
      return []
    }
  },

  async getRecent(limit = 5) {
    await delay()
    try {
      const response = await apperClient.fetchRecords('submission_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "files_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "submitted_at_c"}},
          {"field": {"Name": "lesson_id_c"}},
          {"field": {"Name": "student_id_c"}}
        ],
        orderBy: [{"fieldName": "submitted_at_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": limit, "offset": 0}
      })
      
      if (!response.success) {
        console.error("Error fetching recent submissions:", response.message)
        return []
      }
      
      // Parse files JSON string back to array
      const submissions = (response.data || []).map(submission => ({
        ...submission,
        files: submission.files_c ? JSON.parse(submission.files_c) : []
      }))
      
      return submissions
    } catch (error) {
      console.error("Error fetching recent submissions:", error?.message || error)
      return []
    }
  },

  async getById(id) {
    await delay()
    try {
      const response = await apperClient.getRecordById('submission_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "files_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "submitted_at_c"}},
          {"field": {"Name": "lesson_id_c"}},
          {"field": {"Name": "student_id_c"}}
        ]
      })
      
      if (!response.success) {
        console.error("Error fetching submission:", response.message)
        throw new Error("Submission not found")
      }
      
      // Parse files JSON string back to array
      const submission = {
        ...response.data,
        files: response.data.files_c ? JSON.parse(response.data.files_c) : []
      }
      
      return submission
    } catch (error) {
      console.error("Error fetching submission:", error?.message || error)
      throw new Error("Submission not found")
    }
  },

  async getByStudentId(studentId) {
    await delay()
    try {
      const response = await apperClient.fetchRecords('submission_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "files_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "submitted_at_c"}},
          {"field": {"Name": "lesson_id_c"}},
          {"field": {"Name": "student_id_c"}}
        ],
        where: [
          {"FieldName": "student_id_c", "Operator": "EqualTo", "Values": [parseInt(studentId)]}
        ]
      })
      
      if (!response.success) {
        console.error("Error fetching submissions by student:", response.message)
        return []
      }
      
      // Parse files JSON string back to array
      const submissions = (response.data || []).map(submission => ({
        ...submission,
        files: submission.files_c ? JSON.parse(submission.files_c) : []
      }))
      
      return submissions
    } catch (error) {
      console.error("Error fetching submissions by student:", error?.message || error)
      return []
    }
  },

  async getSubmissionsByStudent() {
    await delay()
    try {
      const allSubmissions = await this.getAll()
      const studentSubmissions = {}
      
      allSubmissions.forEach(submission => {
        const studentId = submission.student_id_c?.Id || submission.student_id_c
        if (studentId) {
          if (!studentSubmissions[studentId]) {
            studentSubmissions[studentId] = []
          }
          studentSubmissions[studentId].push(submission)
        }
      })
      
      return studentSubmissions
    } catch (error) {
      console.error("Error grouping submissions by student:", error?.message || error)
      return {}
    }
  },

  async getByStatus(status) {
    await delay()
    try {
      const response = await apperClient.fetchRecords('submission_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "files_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "submitted_at_c"}},
          {"field": {"Name": "lesson_id_c"}},
          {"field": {"Name": "student_id_c"}}
        ],
        where: [
          {"FieldName": "status_c", "Operator": "EqualTo", "Values": [status]}
        ]
      })
      
      if (!response.success) {
        console.error("Error fetching submissions by status:", response.message)
        return []
      }
      
      // Parse files JSON string back to array
      const submissions = (response.data || []).map(submission => ({
        ...submission,
        files: submission.files_c ? JSON.parse(submission.files_c) : []
      }))
      
      return submissions
    } catch (error) {
      console.error("Error fetching submissions by status:", error?.message || error)
      return []
    }
  },

  async create(submissionData) {
    await delay()
    try {
      const payload = {
        records: [{
          Name: `Submission - ${submissionData.lessonId || 'Unknown'}`,
          content_c: submissionData.content || "",
          files_c: JSON.stringify(submissionData.files || []),
          status_c: "pending",
          submitted_at_c: new Date().toISOString(),
          lesson_id_c: parseInt(submissionData.lessonId),
          student_id_c: parseInt(submissionData.studentId)
        }]
      }
      
      const response = await apperClient.createRecord('submission_c', payload)
      
      if (!response.success) {
        console.error("Error creating submission:", response.message)
        throw new Error(response.message || "Failed to create submission")
      }
      
      let newSubmission
      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        if (!result.success) {
          console.error("Error creating submission:", result.message)
          throw new Error(result.message || "Failed to create submission")
        }
        
        // Parse files back to array
        newSubmission = {
          ...result.data,
          files: result.data.files_c ? JSON.parse(result.data.files_c) : []
        }
      } else {
        newSubmission = response.data
      }
      
      // Create a task for the coach (mock data - task_c table not available)
      const newTask = {
        Id: Math.max(...tasks.map(t => t.Id), 0) + 1,
        submissionId: newSubmission.Id,
        coachId: 2,
        status: "pending",
        dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        priority: "medium"
      }
      tasks.push(newTask)
      
      return newSubmission
    } catch (error) {
      console.error("Error creating submission:", error?.message || error)
      throw error
    }
  },

async update(id, submissionData) {
    await delay()
    try {
      const payload = {
        records: [{
          Id: parseInt(id)
        }]
      }
      
      const record = payload.records[0]
      if (submissionData.content !== undefined) record.content_c = submissionData.content
      if (submissionData.files !== undefined) record.files_c = JSON.stringify(submissionData.files)
      if (submissionData.status !== undefined) record.status_c = submissionData.status
      if (submissionData.submittedAt !== undefined) record.submitted_at_c = submissionData.submittedAt
      if (submissionData.lessonId !== undefined) record.lesson_id_c = parseInt(submissionData.lessonId)
      if (submissionData.studentId !== undefined) record.student_id_c = parseInt(submissionData.studentId)
      
      const response = await apperClient.updateRecord('submission_c', payload)
      
      if (!response.success) {
        console.error("Error updating submission:", response.message)
        throw new Error(response.message || "Failed to update submission")
      }
      
      let updatedSubmission
      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        if (!result.success) {
          console.error("Error updating submission:", result.message)
          throw new Error(result.message || "Failed to update submission")
        }
        
        // Parse files back to array
        updatedSubmission = {
          ...result.data,
          files: result.data.files_c ? JSON.parse(result.data.files_c) : []
        }
      } else {
        updatedSubmission = response.data
      }
      
      // Update task status if submission is approved (mock data - task_c table not available)
      if (submissionData.status === "approved") {
        const taskIndex = tasks.findIndex(t => t.submissionId === parseInt(id))
        if (taskIndex !== -1) {
          tasks[taskIndex].status = "completed"
        }
      }
      
      return updatedSubmission
    } catch (error) {
      console.error("Error updating submission:", error?.message || error)
      throw error
    }
  },

async delete(id) {
    await delay()
    try {
      const response = await apperClient.deleteRecord('submission_c', {
        RecordIds: [parseInt(id)]
      })
      
      if (!response.success) {
        console.error("Error deleting submission:", response.message)
        throw new Error(response.message || "Failed to delete submission")
      }
      
      if (response.results && response.results.length > 0) {
        const result = response.results[0]
        if (!result.success) {
          console.error("Error deleting submission:", result.message)
          throw new Error(result.message || "Failed to delete submission")
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error("Error deleting submission:", error?.message || error)
      throw error
    }
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

  async getAllComments() {
    await delay()
    return [...comments]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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