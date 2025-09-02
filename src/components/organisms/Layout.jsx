import { useState } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import UserAvatar from "@/components/molecules/UserAvatar"
import Button from "@/components/atoms/Button"

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  // Mock current user
  const currentUser = {
    Id: 1,
    name: "Sarah Johnson",
    role: "admin",
    email: "sarah@example.com"
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
    { name: 'Courses', href: '/courses', icon: 'BookOpen' },
    { name: 'Students', href: '/students', icon: 'Users' },
    { name: 'Reviews', href: '/reviews', icon: 'MessageSquare' },
    { name: 'Tasks', href: '/tasks', icon: 'CheckSquare' },
    { name: 'Deliverables', href: '/deliverables', icon: 'Award' },
    { name: 'Search', href: '/search', icon: 'Search' }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.div
        initial={{ width: sidebarOpen ? 256 : 64 }}
        animate={{ width: sidebarOpen ? 256 : 64 }}
        className="bg-white border-r border-gray-200 flex flex-col"
      >
        {/* Logo */}
        <div className="p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="GraduationCap" className="h-5 w-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="ml-3 text-lg font-semibold text-gray-900">LearnFlow</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 pb-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href))
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <ApperIcon name={item.icon} className="h-5 w-5" />
                    {sidebarOpen && (
                      <span className="ml-3">{item.name}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <UserAvatar user={currentUser} size="sm" />
            {sidebarOpen && (
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {currentUser.role}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Toggle */}
        <div className="p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full justify-center"
          >
            <ApperIcon 
              name={sidebarOpen ? "PanelLeftClose" : "PanelLeftOpen"} 
              className="h-4 w-4" 
            />
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
<div className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar">
        <Outlet />
      </div>
    </div>
  )
}

export default Layout