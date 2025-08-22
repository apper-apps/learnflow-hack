import { cn } from "@/utils/cn"

const Badge = ({ 
  children, 
  variant = "default", 
  size = "sm", 
  className 
}) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 border-gray-200",
    primary: "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 border-primary-300",
    secondary: "bg-gradient-to-r from-secondary-100 to-secondary-200 text-secondary-800 border-secondary-300",
    success: "bg-gradient-to-r from-success-100 to-success-200 text-success-800 border-success-300",
    warning: "bg-gradient-to-r from-warning-100 to-warning-200 text-warning-800 border-warning-300",
    error: "bg-gradient-to-r from-error-100 to-error-200 text-error-800 border-error-300",
    info: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300"
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