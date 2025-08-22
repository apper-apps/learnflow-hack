import ApperIcon from "@/components/ApperIcon"

const UserAvatar = ({ 
  user, 
  size = "md", 
  showName = false, 
  className = "" 
}) => {
  const sizes = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
    xl: "h-16 w-16 text-xl"
  }

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  }

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-br from-primary-500 to-primary-600 text-white"
      case "coach":
        return "bg-gradient-to-br from-secondary-500 to-secondary-600 text-white"
      case "student":
        return "bg-gradient-to-br from-accent-500 to-accent-600 text-white"
      default:
        return "bg-gradient-to-br from-gray-500 to-gray-600 text-white"
    }
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold ${getRoleColor(user?.role)}`}>
        {user?.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          getInitials(user?.name)
        )}
      </div>
      
      {showName && (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{user?.name}</span>
          <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
        </div>
      )}
    </div>
  )
}

export default UserAvatar