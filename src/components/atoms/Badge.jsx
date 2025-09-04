import { cn } from "@/utils/cn"

const Badge = ({ 
  children, 
  variant = "default", 
  size = "sm", 
  className 
}) => {
  const variants = {
default: "bg-gray-100 text-gray-700 border-gray-200",
    primary: "bg-primary-50 text-primary-700 border-primary-200",
    secondary: "bg-secondary-50 text-secondary-700 border-secondary-200",
    success: "bg-success-50 text-success-700 border-success-200",
    warning: "bg-warning-50 text-warning-700 border-warning-200",
    error: "bg-error-50 text-error-700 border-error-200",
    info: "bg-blue-50 text-blue-700 border-blue-200"
  }
  
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-sm"
  }

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border transition-all duration-200",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}

export default Badge