import { forwardRef } from "react"
import { cn } from "@/utils/cn"
import ApperIcon from "@/components/ApperIcon"

const Select = forwardRef(({ 
  className, 
  label,
  error,
  children,
  ...props 
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={cn(
"flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
            "transition-all duration-200 appearance-none",
            error && "border-error-500 focus:ring-error-500",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ApperIcon 
          name="ChevronDown" 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
        />
      </div>
      {error && (
        <p className="text-sm text-error-600">{error}</p>
      )}
    </div>
  )
})

Select.displayName = "Select"

export default Select