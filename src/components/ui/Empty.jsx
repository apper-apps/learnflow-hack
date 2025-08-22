import { motion } from "framer-motion"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"

const Empty = ({ 
  icon = "FileX",
  title = "No data found",
  message = "Get started by creating your first item.",
  actionLabel = "Get Started",
  onAction = null,
  showAction = true
}) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-md mx-auto px-6"
      >
        <div className="mb-6">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <ApperIcon 
              name={icon} 
              className="h-10 w-10 text-gray-400" 
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {title}
          </h3>
          <p className="text-gray-500 leading-relaxed">
            {message}
          </p>
        </div>

        {showAction && onAction && (
          <div className="mt-8">
            <Button
              onClick={onAction}
              variant="primary"
              size="md"
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transform hover:scale-105 transition-all duration-200"
            >
              <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
              {actionLabel}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Empty