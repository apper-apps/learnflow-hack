import { motion } from "framer-motion"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"

const Error = ({ 
  title = "Something went wrong",
  message = "We encountered an error while loading your content. Please try again.",
  onRetry = null,
  showRetry = true
}) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-md mx-auto px-6"
      >
<div className="mb-6">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-error-50 to-error-100 rounded-full flex items-center justify-center">
            <ApperIcon 
              name="AlertTriangle" 
              className="h-8 w-8 text-error-600" 
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        {showRetry && (
          <div className="mt-8">
            <Button
              onClick={onRetry}
              variant="primary"
              size="md"
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
            >
              <ApperIcon name="RotateCcw" className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Error