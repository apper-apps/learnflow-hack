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
primary: "bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 focus:ring-2 focus:ring-offset-2",
    secondary: "bg-secondary-600 hover:bg-secondary-700 text-white focus:ring-secondary-500 focus:ring-2 focus:ring-offset-2",
    outline: "border border-gray-300 hover:border-primary-500 text-gray-700 hover:text-primary-600 bg-white hover:bg-primary-50 focus:ring-primary-500 focus:ring-2 focus:ring-offset-2",
    ghost: "text-gray-700 hover:text-primary-600 hover:bg-primary-50 focus:ring-primary-500 focus:ring-2 focus:ring-offset-2",
    tab: "text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 bg-transparent focus:ring-primary-500",
    link: "text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline focus:ring-primary-500",
    success: "bg-success-600 hover:bg-success-700 text-white focus:ring-success-500 focus:ring-2 focus:ring-offset-2",
    warning: "bg-warning-600 hover:bg-warning-700 text-white focus:ring-warning-500 focus:ring-2 focus:ring-offset-2",
    error: "bg-error-600 hover:bg-error-700 text-white focus:ring-error-500 focus:ring-2 focus:ring-offset-2"
  }
const sizes = {
    sm: "px-3 py-2 text-sm",
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