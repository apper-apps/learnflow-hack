import { motion } from "framer-motion"

const Loading = ({ type = "page" }) => {
  if (type === "skeleton") {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton h-8 w-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
            <div className="skeleton h-4 w-72 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
          </div>
          <div className="skeleton h-10 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
        </div>

        {/* Card Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="space-y-4">
                <div className="skeleton h-6 w-3/4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="skeleton h-4 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                  <div className="skeleton h-4 w-2/3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="skeleton h-8 w-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
                  <div className="skeleton h-6 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-gray-200 border-t-primary-500"
        />
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Loading...</h3>
          <p className="text-sm text-gray-500">Please wait while we prepare your content</p>
        </div>
      </div>
    </div>
  )
}

export default Loading