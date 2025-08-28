import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card"
import Button from "@/components/atoms/Button"
import Select from "@/components/atoms/Select"
import SearchBar from "@/components/molecules/SearchBar"
import ApperIcon from "@/components/ApperIcon"
import Loading from "@/components/ui/Loading"
import Empty from "@/components/ui/Empty"
import { searchService } from "@/services/api/searchService"
import { courseService } from "@/services/api/courseService"

const SemanticSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [scope, setScope] = useState('all') // 'all', 'course:id', 'lesson:id'
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    loadInitialData()
    if (query) {
      handleSearch(query)
    }
  }, [])

  const loadInitialData = async () => {
    try {
      const [coursesData, recentData, analyticsData] = await Promise.all([
        courseService.getAll(),
        searchService.getRecentSearches(1), // Mock user ID
        searchService.getSearchAnalytics()
      ])
      setCourses(coursesData)
      setRecentSearches(recentData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Failed to load search data:', error)
    }
  }

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    setQuery(searchQuery)
    
    // Update URL
    setSearchParams({ q: searchQuery })

    try {
      const scopeOptions = {}
      if (scope.startsWith('course:')) {
        scopeOptions.courseId = scope.split(':')[1]
      } else if (scope.startsWith('lesson:')) {
        scopeOptions.lessonId = scope.split(':')[1]
      }

      const searchResults = await searchService.searchTranscripts(searchQuery, scopeOptions)
      setResults(searchResults)
      
      if (searchResults.length === 0) {
        toast.info("No results found. Try different keywords or expand your search scope.")
      }
    } catch (error) {
      toast.error("Search failed. Please try again.")
      setResults([])
    }
    
    setLoading(false)
  }

  const handleResultClick = (result) => {
    // Navigate to course player and seek to timestamp
    navigate(`/courses/${result.courseId || 1}/play/${result.lessonId}?t=${result.startSeconds}`)
  }

  const handleRecentSearchClick = (recentQuery) => {
    setQuery(recentQuery.queryText)
    handleSearch(recentQuery.queryText)
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Semantic Search
          </h1>
          <p className="text-gray-600 mt-2">
            Search across all course content using natural language
          </p>
        </div>

        {/* Search Controls */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search for concepts, topics, or specific content..."
              onSearch={handleSearch}
              value={query}
              enableSemantic={false} // Direct search, no debouncing
              className="w-full"
            />
          </div>
          
          <div className="lg:w-64">
            <Select
              value={scope}
              onValueChange={setScope}
              placeholder="Search scope"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.Id} value={`course:${course.Id}`}>
                  {course.title}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Results */}
        <div className="lg:col-span-3 space-y-6">
          {loading && (
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
                  <span className="text-gray-600">Searching through course content...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
                <p className="text-sm text-gray-600">
                  Found {results.length} relevant segments
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.map((result) => (
                  <motion.div
                    key={result.chunkId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">
                          {result.lessonTitle}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <ApperIcon name="Play" className="h-4 w-4 mr-1" />
                          {formatTime(result.startSeconds)} - {formatTime(result.endSeconds)}
                          <span className="mx-2">•</span>
                          <span className="text-primary-600 font-medium">
                            {(result.confidence * 100).toFixed(1)}% match
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ApperIcon name="ExternalLink" className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-gray-700 leading-relaxed">
                      {result.snippet.split('**').map((part, index) => 
                        index % 2 === 1 ? (
                          <mark key={index} className="bg-yellow-200 px-1 rounded">
                            {part}
                          </mark>
                        ) : (
                          part
                        )
                      )}
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          )}

          {!loading && !results.length && query && (
            <Empty
              icon="Search"
              title="No Results Found"
              message="Try different keywords or expand your search scope to find more content."
              action={
                <Button
                  onClick={() => {
                    setQuery('')
                    setResults([])
                    setSearchParams({})
                  }}
                  variant="outline"
                >
                  Clear Search
                </Button>
              }
            />
          )}

          {!loading && !query && (
            <Card>
              <CardContent className="p-8 text-center">
                <ApperIcon name="Search" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Search Course Content
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Enter your search query above to find relevant content across all course transcripts and materials.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Searches</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentSearches.slice(0, 5).map((search) => (
                  <button
                    key={search.Id}
                    onClick={() => handleRecentSearchClick(search)}
                    className="w-full text-left p-2 rounded-md hover:bg-gray-50 transition-colors text-sm text-gray-700 border border-transparent hover:border-gray-200"
                  >
                    <div className="truncate">{search.queryText}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(search.createdAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Search Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <ApperIcon name="Lightbulb" className="h-4 w-4 mr-2 mt-0.5 text-yellow-500" />
                <span>Use natural language to describe concepts you're looking for</span>
              </div>
              <div className="flex items-start">
                <ApperIcon name="Target" className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                <span>Try specific terms or broader topic areas</span>
              </div>
              <div className="flex items-start">
                <ApperIcon name="Filter" className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                <span>Narrow your search by selecting a specific course</span>
              </div>
              <div className="flex items-start">
                <ApperIcon name="Clock" className="h-4 w-4 mr-2 mt-0.5 text-purple-500" />
                <span>Click results to jump directly to video timestamps</span>
              </div>
            </CardContent>
          </Card>

          {/* Search Stats */}
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Searches</span>
                  <span className="font-medium">{analytics.totalSearches}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Searchers</span>
                  <span className="font-medium">{analytics.uniqueUsers}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default SemanticSearch