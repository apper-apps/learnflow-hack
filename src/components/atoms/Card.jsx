import { forwardRef } from "react"
import { cn } from "@/utils/cn"

const Card = forwardRef(({ className, children, onClick, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
"rounded-lg border border-gray-100 bg-white transition-all duration-200",
      "hover:border-gray-200",
      onClick && "cursor-pointer",
      className
    )}
    onClick={onClick}
    {...props}
  >
    {children}
  </div>
))

const CardHeader = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
    {...props}
  />
))

const CardTitle = forwardRef(({ className, ...props }, ref) => (
  <h3
ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight text-gray-900",
      className
    )}
    {...props}
  />
))

const CardDescription = forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
className={cn("text-sm text-gray-500 leading-relaxed", className)}
    {...props}
  />
))

const CardContent = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-2", className)} {...props} />
))

const CardFooter = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-2", className)}
    {...props}
  />
))

Card.displayName = "Card"
CardHeader.displayName = "CardHeader"
CardTitle.displayName = "CardTitle"
CardDescription.displayName = "CardDescription"
CardContent.displayName = "CardContent"
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }