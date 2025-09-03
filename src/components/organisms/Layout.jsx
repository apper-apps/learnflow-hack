import { useState } from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import UserAvatar from "@/components/molecules/UserAvatar"

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const navigate = useNavigate()

  // Mock current user - in real app this would come from auth context
  const currentUser = {
    Id: 1,
    name: "Sarah Johnson",
    email: "sarah@learnflow.com",
    role: "admin",
    avatar: null
  }

  const navigationItems = [
    { 
      name: "Dashboard", 
      href: "/", 
      icon: "Home",
      roles: ["admin", "coach", "student"]
    },
    { 
      name: "Courses", 
      href: "/courses", 
      icon: "BookOpen",
      roles: ["admin", "coach", "student"]
    },
    { 
      name: "Students", 
      href: "/students", 
      icon: "Users",
      roles: ["admin", "coach"]
    },
    { 
      name: "Reviews", 
      href: "/reviews", 
      icon: "MessageSquare",
      roles: ["coach"]
    },
    { 
      name: "Deliverables", 
      href: "/deliverables", 
      icon: "Award",
      roles: ["admin", "coach", "student"]
    },
{ 
      name: "Tasks", 
      href: "/tasks", 
      icon: "CheckSquare",
      roles: ["coach"]
    },
    { 
      name: "Messages", 
      href: "/chat", 
icon: "Mail",
      roles: ["admin", "coach"]
    },
    {
      title: "Account",
      path: "/account",
      icon: "User",
      roles: ["admin", "coach", "student"]
    }
  ]

  const filteredNavigation = navigationItems.filter(item => 
    item.roles.includes(currentUser.role)
  )

const NavItem = ({ item, mobile = false, collapsed = false }) => (
    <NavLink
      to={item.href}
      onClick={mobile ? () => setSidebarOpen(false) : undefined}
      className={({ isActive }) =>
        `flex items-center ${collapsed ? 'justify-center px-3' : 'px-4'} py-3 text-sm font-medium rounded-lg transition-all duration-200 group relative ${
          isActive
            ? "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 shadow-sm"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        }`
      }
      title={collapsed ? item.name : undefined}
    >
      <ApperIcon name={item.icon} className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} />
      {!collapsed && item.name}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {item.name}
        </div>
      )}
    </NavLink>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
<motion.div 
        className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:overflow-y-auto lg:bg-white lg:border-r lg:border-gray-200 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-72'
        }`}
        initial={false}
        animate={{ width: sidebarCollapsed ? 64 : 288 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center px-4' : 'px-6'} py-8`}>
            {sidebarCollapsed ? (
              <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="GraduationCap" className="h-6 w-6 text-white" />
              </div>
            ) : (
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                  <ApperIcon name="GraduationCap" className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                    LearnFlow Pro
                  </h1>
                  <p className="text-xs text-gray-500">Course & Coaching Platform</p>
                </div>
              </div>
            )}
          </div>

          {/* Toggle Button */}
          <div className={`${sidebarCollapsed ? 'px-4' : 'px-6'} pb-4`}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ApperIcon name={sidebarCollapsed ? "ChevronRight" : "ChevronLeft"} className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 ${sidebarCollapsed ? 'px-2' : 'px-6'} space-y-2`}>
            {filteredNavigation.map((item) => (
              <NavItem key={item.name} item={item} collapsed={sidebarCollapsed} />
            ))}
          </nav>

          {/* User Profile */}
          <div className={`${sidebarCollapsed ? 'px-2' : 'px-6'} py-6 border-t border-gray-200`}>
            {sidebarCollapsed ? (
              <div className="flex justify-center">
                <UserAvatar user={currentUser} size="md" />
              </div>
            ) : (
              <div className="flex items-center">
                <UserAvatar user={currentUser} size="md" showName />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                      <ApperIcon name="GraduationCap" className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                        LearnFlow Pro
                      </h1>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <ApperIcon name="X" className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 px-6 py-4 space-y-2">
                  {filteredNavigation.map((item) => (
                    <NavItem key={item.name} item={item} mobile />
                  ))}
                </nav>

                {/* Mobile User Profile */}
                <div className="px-6 py-4 border-t border-gray-200">
                  <UserAvatar user={currentUser} size="md" showName />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
<div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-72'}`}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-white lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ApperIcon name="Menu" className="h-6 w-6" />
          </button>
          
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="GraduationCap" className="h-5 w-5 text-white" />
            </div>
            <h1 className="ml-2 text-lg font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              LearnFlow Pro
            </h1>
          </div>
          
          <UserAvatar user={currentUser} size="sm" />
        </div>

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout