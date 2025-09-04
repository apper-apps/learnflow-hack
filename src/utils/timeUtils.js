/**
 * Time utility functions for formatting and calculating time differences
 */

/**
 * Calculate and format time ago from a timestamp
 * @param {string|number|Date} timestamp - The timestamp to calculate from
 * @returns {string} Formatted time ago string
 */
export const getTimeAgo = (timestamp) => {
  if (!timestamp) return "Never"
  
  try {
    const now = new Date()
    const date = new Date(timestamp)
    
    // Validate date
    if (isNaN(date.getTime())) return "Invalid date"
    
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  } catch (error) {
    console.error('Error calculating time ago:', error)
    return "Unknown"
  }
}

/**
 * Format a date to a readable string
 * @param {string|number|Date} timestamp - The timestamp to format
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return "No date"
  
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return "Invalid date"
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return "Unknown date"
  }
}

/**
 * Check if a timestamp is today
 * @param {string|number|Date} timestamp - The timestamp to check
 * @returns {boolean} True if timestamp is today
 */
export const isToday = (timestamp) => {
  if (!timestamp) return false
  
  try {
    const date = new Date(timestamp)
    const today = new Date()
    
    return date.toDateString() === today.toDateString()
  } catch (error) {
    return false
  }
}
/**
 * Time utility functions for formatting and calculating time differences
 */

/**
 * Calculate and format time ago from a timestamp
 * @param {string|number|Date} timestamp - The timestamp to calculate from
 * @returns {string} Formatted time ago string
 */
export const getTimeAgo = (timestamp) => {
  if (!timestamp) return "Never"
  
  try {
    const now = new Date()
    const date = new Date(timestamp)
    
    // Validate date
    if (isNaN(date.getTime())) return "Invalid date"
    
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  } catch (error) {
    console.error('Error calculating time ago:', error)
    return "Unknown"
  }
}

/**
 * Format a date to a readable string
 * @param {string|number|Date} timestamp - The timestamp to format
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return "No date"
  
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return "Invalid date"
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return "Unknown date"
  }
}

/**
 * Check if a timestamp is today
 * @param {string|number|Date} timestamp - The timestamp to check
 * @returns {boolean} True if timestamp is today
 */
export const isToday = (timestamp) => {
  if (!timestamp) return false
  
  try {
    const date = new Date(timestamp)
    const today = new Date()
    
    return date.toDateString() === today.toDateString()
  } catch (error) {
    return false
  }
}