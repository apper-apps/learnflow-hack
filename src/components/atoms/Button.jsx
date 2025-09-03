import { forwardRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/utils/cn"

const Button = forwardRef(({ 
  children, 
  className, 
  variant = "primary", 
  size = "md", 
  disabled = false,
  loading = false,
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
const variants = {
    primary: "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white focus:ring-primary-500 shadow-sm hover:shadow-md transform hover:scale-105",
    secondary: "bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white focus:ring-secondary-500 shadow-sm hover:shadow-md transform hover:scale-105",
    outline: "border-2 border-gray-300 hover:border-primary-500 text-gray-700 hover:text-primary-600 bg-white hover:bg-primary-50 focus:ring-primary-500",
    ghost: "text-gray-700 hover:text-primary-600 hover:bg-primary-50 focus:ring-primary-500",
    tab: "text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 bg-transparent focus:ring-primary-500",
    "tab-active": "text-primary-600 border-b-2 border-primary-600 bg-transparent focus:ring-primary-500 font-medium",
    success: "bg-gradient-to-r from-success-600 to-success-700 hover:from-success-700 hover:to-success-800 text-white focus:ring-success-500 shadow-sm hover:shadow-md transform hover:scale-105",
    warning: "bg-gradient-to-r from-warning-600 to-warning-700 hover:from-warning-700 hover:to-warning-800 text-white focus:ring-warning-500 shadow-sm hover:shadow-md transform hover:scale-105",
    error: "bg-gradient-to-r from-error-600 to-error-700 hover:from-error-700 hover:to-error-800 text-white focus:ring-error-500 shadow-sm hover:shadow-md transform hover:scale-105"
  }
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg"
  }

  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
        />
      )}
      {children}
    </motion.button>
  )
})

Button.displayName = "Button"

export default Button