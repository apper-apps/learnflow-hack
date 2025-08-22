import Badge from "@/components/atoms/Badge"
import ApperIcon from "@/components/ApperIcon"

const StatusBadge = ({ status, type = "submission" }) => {
  const statusConfig = {
    submission: {
      pending: { 
        variant: "warning", 
        icon: "Clock", 
        label: "Pending Review" 
      },
      approved: { 
        variant: "success", 
        icon: "CheckCircle", 
        label: "Approved" 
      },
      changes_requested: { 
        variant: "error", 
        icon: "AlertCircle", 
        label: "Changes Requested" 
      },
      draft: { 
        variant: "default", 
        icon: "Edit", 
        label: "Draft" 
      }
    },
    course: {
      draft: { 
        variant: "default", 
        icon: "Edit", 
        label: "Draft" 
      },
      published: { 
        variant: "success", 
        icon: "CheckCircle", 
        label: "Published" 
      },
      archived: { 
        variant: "error", 
        icon: "Archive", 
        label: "Archived" 
      }
    },
    lesson: {
      draft: { 
        variant: "default", 
        icon: "Edit", 
        label: "Draft" 
      },
      published: { 
        variant: "success", 
        icon: "CheckCircle", 
        label: "Published" 
      }
    },
    task: {
      pending: { 
        variant: "warning", 
        icon: "Clock", 
        label: "Pending" 
      },
      completed: { 
        variant: "success", 
        icon: "CheckCircle", 
        label: "Completed" 
      },
      overdue: { 
        variant: "error", 
        icon: "AlertTriangle", 
        label: "Overdue" 
      }
    }
  }

  const config = statusConfig[type]?.[status] || statusConfig.submission.pending

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <ApperIcon name={config.icon} className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

export default StatusBadge