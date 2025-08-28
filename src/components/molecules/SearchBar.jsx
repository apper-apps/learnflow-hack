import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Input from "@/components/atoms/Input";

const SearchBar = ({ 
  placeholder = "Search...", 
  onSearch, 
  className = "",
  enableSemantic = false,
  debounceMs = 300
}) => {
  const [value, setValue] = useState("")

  const handleSearch = (e) => {
const newValue = e.target.value
    setValue(newValue)
    
    if (enableSemantic && newValue.trim()) {
      // Debounced semantic search
      clearTimeout(window.searchTimeout)
      window.searchTimeout = setTimeout(() => {
        if (onSearch) {
          onSearch(newValue)
        }
      }, debounceMs)
    } else if (!enableSemantic && onSearch) {
      onSearch(newValue)
    }
  }

const navigate = useNavigate()

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && enableSemantic && value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <ApperIcon 
        name="Search" 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
      />
<Input
        value={value}
        onChange={handleSearch}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="pl-10"
      />
    </div>
  )
}

export default SearchBar