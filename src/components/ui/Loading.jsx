import { motion } from "framer-motion";
import React from "react";

const Loading = ({ type = "page" }) => {
  if (type === "skeleton") {
    return (
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton h-8 w-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
            <div className="skeleton h-4 w-72 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
          </div>
          <div className="skeleton h-10 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="skeleton h-4 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                  <div className="skeleton h-8 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                  <div className="skeleton h-3 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                </div>
                <div className="skeleton h-12 w-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Card Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="space-y-4">
                <div className="skeleton h-6 w-3/4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center space-x-3">
                      <div className="skeleton h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="skeleton h-4 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                        <div className="skeleton h-3 w-2/3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                      </div>
                    </div>
                  ))}
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </motion.div>
    </div>
  )
}

export default Loading