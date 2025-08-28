import transcriptChunksData from "@/services/mockData/transcriptChunks.json"
import searchQueriesData from "@/services/mockData/searchQueries.json"
import lessonsData from "@/services/mockData/lessons.json"
import coursesData from "@/services/mockData/courses.json"

let transcriptChunks = [...transcriptChunksData]
let searchQueries = [...searchQueriesData]
let lessons = [...lessonsData]
let courses = [...coursesData]

// Mock embedding generation
const generateEmbedding = async (text) => {
  await delay(100) // Simulate API call
  // Generate mock embedding vector (384 dimensions)
  const vector = Array.from({ length: 384 }, () => Math.random() - 0.5)
  return vector
}

// Calculate cosine similarity between two vectors
const cosineSimilarity = (a, b) => {
  const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0)
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0))
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0))
  return dotProduct / (normA * normB)
}

// Merge adjacent chunks
const mergeAdjacentChunks = (chunks) => {
  const merged = []
  let i = 0
  
  while (i < chunks.length) {
    let currentChunk = { ...chunks[i] }
    let j = i + 1
    
    // Look for adjacent chunks from the same lesson
    while (j < chunks.length && 
           chunks[j].lessonId === currentChunk.lessonId &&
           chunks[j].startSeconds <= currentChunk.endSeconds + 5) {
      // Merge chunks
      currentChunk.endSeconds = Math.max(currentChunk.endSeconds, chunks[j].endSeconds)
      currentChunk.text += " " + chunks[j].text
      j++
    }
    
    merged.push(currentChunk)
    i = j
  }
  
  return merged
}

// Build search snippet with highlighting
const buildSnippet = (text, query, maxLength = 240) => {
  const queryWords = query.toLowerCase().split(/\s+/)
  let snippet = text
  
  // Simple highlighting simulation
  queryWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    snippet = snippet.replace(regex, `**${word}**`)
  })
  
  if (snippet.length > maxLength) {
    const start = Math.max(0, snippet.indexOf('**') - 50)
    snippet = (start > 0 ? '...' : '') + 
              snippet.substring(start, start + maxLength) + 
              (start + maxLength < snippet.length ? '...' : '')
  }
  
  return snippet
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const searchService = {
  // Search transcripts with semantic similarity
  async searchTranscripts(query, options = {}) {
    try {
      await delay(300) // Simulate processing time
      
      const { courseId, lessonId, limit = 20, threshold = 0.55 } = options
      
      // Generate embedding for query
      const queryEmbedding = await generateEmbedding(query)
      
      // Filter chunks by scope
      let filteredChunks = transcriptChunks
      if (lessonId) {
        filteredChunks = transcriptChunks.filter(chunk => chunk.lessonId === parseInt(lessonId))
      } else if (courseId) {
        const courseLessons = lessons.filter(lesson => 
          lesson.moduleId && courses.find(course => 
            course.Id === parseInt(courseId)
          )
        )
        const lessonIds = courseLessons.map(lesson => lesson.Id)
        filteredChunks = transcriptChunks.filter(chunk => 
          lessonIds.includes(chunk.lessonId)
        )
      }
      
      // Calculate similarities
      const results = []
      for (const chunk of filteredChunks) {
        const similarity = cosineSimilarity(queryEmbedding, chunk.embeddingVector)
        if (similarity >= threshold) {
          const lesson = lessons.find(l => l.Id === chunk.lessonId)
          results.push({
            chunkId: chunk.Id,
            lessonId: chunk.lessonId,
            lessonTitle: lesson?.title || 'Unknown Lesson',
            startSeconds: chunk.startSeconds,
            endSeconds: chunk.endSeconds,
            text: chunk.text,
            confidence: similarity,
            snippet: buildSnippet(chunk.text, query)
          })
        }
      }
      
      // Sort by similarity score
      results.sort((a, b) => b.confidence - a.confidence)
      
      // Merge adjacent chunks
      const mergedResults = mergeAdjacentChunks(results)
      
      // Log search query
      await this.logSearchQuery({
        userId: 1, // Mock user ID
        courseId: courseId ? parseInt(courseId) : null,
        queryText: query,
        topResultIds: mergedResults.slice(0, 5).map(r => r.chunkId)
      })
      
      return mergedResults.slice(0, limit)
    } catch (error) {
      console.error('Search error:', error)
      throw new Error('Search failed')
    }
  },
  
  // Index lesson transcript
  async indexTranscript(lessonId, transcriptText, timecodes = []) {
    try {
      // Remove existing chunks for this lesson
      transcriptChunks = transcriptChunks.filter(chunk => chunk.lessonId !== lessonId)
      
      // Chunk the transcript
      const chunks = await this.chunkTranscript(transcriptText, timecodes)
      
      // Generate embeddings and store chunks
      for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk.text)
        const transcriptChunk = {
          Id: transcriptChunks.length + 1,
          lessonId: lessonId,
          startSeconds: chunk.startSeconds,
          endSeconds: chunk.endSeconds,
          text: chunk.text,
          embeddingVector: embedding
        }
        transcriptChunks.push(transcriptChunk)
      }
      
      return chunks.length
    } catch (error) {
      console.error('Indexing error:', error)
      throw new Error('Transcript indexing failed')
    }
  },
  
  // Chunk transcript with overlap
  async chunkTranscript(text, timecodes = []) {
    const chunks = []
    const chunkSize = 500 // Target 400-600 characters
    const overlap = 100   // 80-120 character overlap
    
    let start = 0
    let chunkIndex = 0
    
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length)
      let chunkText = text.substring(start, end)
      
      // Try to break at word boundary
      if (end < text.length) {
        const lastSpace = chunkText.lastIndexOf(' ')
        if (lastSpace > chunkSize * 0.8) {
          chunkText = chunkText.substring(0, lastSpace)
        }
      }
      
      // Calculate time range (mock implementation)
      const startTime = timecodes.length > chunkIndex ? 
        timecodes[chunkIndex]?.startSeconds || chunkIndex * 30 :
        chunkIndex * 30
      const endTime = startTime + Math.floor(chunkText.length / 10) // Rough estimate
      
      chunks.push({
        text: chunkText.trim(),
        startSeconds: startTime,
        endSeconds: endTime
      })
      
      start = end - overlap
      chunkIndex++
    }
    
    return chunks
  },
  
  // Log search query
  async logSearchQuery(queryData) {
    try {
      const searchQuery = {
        Id: searchQueries.length + 1,
        userId: queryData.userId,
        courseId: queryData.courseId,
        queryText: queryData.queryText,
        createdAt: new Date().toISOString(),
        topResultIds: queryData.topResultIds
      }
      searchQueries.push(searchQuery)
      return searchQuery
    } catch (error) {
      console.error('Query logging error:', error)
    }
  },
  
  // Get recent searches for user
  async getRecentSearches(userId, limit = 10) {
    try {
      await delay(100)
      return searchQueries
        .filter(query => query.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit)
    } catch (error) {
      console.error('Recent searches error:', error)
      return []
    }
  },
  
  // Get search analytics
  async getSearchAnalytics(courseId = null) {
    try {
      await delay(200)
      let queries = searchQueries
      if (courseId) {
        queries = queries.filter(q => q.courseId === courseId)
      }
      
      const totalSearches = queries.length
      const uniqueUsers = new Set(queries.map(q => q.userId)).size
      const popularQueries = Object.entries(
        queries.reduce((acc, q) => {
          acc[q.queryText] = (acc[q.queryText] || 0) + 1
          return acc
        }, {})
      )
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      
      return {
        totalSearches,
        uniqueUsers,
        popularQueries: popularQueries.map(([query, count]) => ({ query, count }))
      }
    } catch (error) {
      console.error('Analytics error:', error)
      return { totalSearches: 0, uniqueUsers: 0, popularQueries: [] }
    }
  }
}