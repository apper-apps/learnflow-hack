import coursesData from "@/services/mockData/courses.json"
import modulesData from "@/services/mockData/modules.json"
import lessonsData from "@/services/mockData/lessons.json"

let courses = [...coursesData]
let modules = [...modulesData]
let lessons = [...lessonsData]

const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 200))

export const courseService = {
  async getAll() {
    await delay()
    return [...courses]
  },

  async getById(id) {
    await delay()
    const course = courses.find(c => c.Id === parseInt(id))
    if (!course) {
      throw new Error("Course not found")
    }
    return { ...course }
  },

  async create(courseData) {
    await delay()
    const newCourse = {
      Id: Math.max(...courses.map(c => c.Id)) + 1,
      ...courseData,
      createdAt: new Date().toISOString()
    }
    courses.push(newCourse)
    return { ...newCourse }
  },

  async update(id, courseData) {
    await delay()
    const index = courses.findIndex(c => c.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Course not found")
    }
    courses[index] = { ...courses[index], ...courseData }
    return { ...courses[index] }
  },

  async delete(id) {
    await delay()
    const index = courses.findIndex(c => c.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Course not found")
    }
    const deletedCourse = courses.splice(index, 1)[0]
    return { ...deletedCourse }
  },

  async getCourseStructure(courseId) {
    await delay()
    const course = courses.find(c => c.Id === parseInt(courseId))
    if (!course) {
      throw new Error("Course not found")
    }

    const courseModules = modules
      .filter(m => m.courseId === parseInt(courseId))
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(module => ({
        ...module,
        lessons: lessons
          .filter(l => l.moduleId === module.Id)
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map(l => ({ ...l }))
      }))

    return {
      ...course,
      modules: courseModules
    }
  }
}

export const moduleService = {
  async getAll() {
    await delay()
    return [...modules]
  },

  async getByCourseId(courseId) {
    await delay()
    return modules
      .filter(m => m.courseId === parseInt(courseId))
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(m => ({ ...m }))
  },

  async create(moduleData) {
    await delay()
    const newModule = {
      Id: Math.max(...modules.map(m => m.Id)) + 1,
      ...moduleData,
      createdAt: new Date().toISOString()
    }
    modules.push(newModule)
    return { ...newModule }
  },

  async update(id, moduleData) {
    await delay()
    const index = modules.findIndex(m => m.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Module not found")
    }
    modules[index] = { ...modules[index], ...moduleData }
    return { ...modules[index] }
  },

  async delete(id) {
    await delay()
    const index = modules.findIndex(m => m.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Module not found")
    }
    const deletedModule = modules.splice(index, 1)[0]
    return { ...deletedModule }
  }
}

export const lessonService = {
  async getAll() {
    await delay()
    return [...lessons]
  },

  async getById(id) {
    await delay()
    const lesson = lessons.find(l => l.Id === parseInt(id))
    if (!lesson) {
      throw new Error("Lesson not found")
    }
    return { ...lesson }
  },

  async getByModuleId(moduleId) {
    await delay()
    return lessons
      .filter(l => l.moduleId === parseInt(moduleId))
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(l => ({ ...l }))
  },

  async create(lessonData) {
    await delay()
    const newLesson = {
      Id: Math.max(...lessons.map(l => l.Id)) + 1,
      ...lessonData,
      createdAt: new Date().toISOString()
    }
    lessons.push(newLesson)
    return { ...newLesson }
  },

  async update(id, lessonData) {
    await delay()
    const index = lessons.findIndex(l => l.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Lesson not found")
    }
    lessons[index] = { ...lessons[index], ...lessonData }
    return { ...lessons[index] }
  },

  async delete(id) {
    await delay()
    const index = lessons.findIndex(l => l.Id === parseInt(id))
    if (index === -1) {
      throw new Error("Lesson not found")
    }
    const deletedLesson = lessons.splice(index, 1)[0]
    return { ...deletedLesson }
  }
}