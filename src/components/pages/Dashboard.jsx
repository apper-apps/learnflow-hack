import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { activityService } from "@/services/api/activityService";
import { commentService, submissionService } from "@/services/api/submissionService";
import { userService } from "@/services/api/userService";
import { aiCoachService } from "@/services/api/aiCoachService";
import { enrollmentService } from "@/services/api/enrollmentService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Chat from "@/components/pages/Chat";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import UserAvatar from "@/components/molecules/UserAvatar";
import StatusBadge from "@/components/molecules/StatusBadge";
import ProgressRing from "@/components/molecules/ProgressRing";
import SearchBar from "@/components/molecules/SearchBar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { getTimeAgo } from "@/utils/timeUtils";
const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [showAllAIResponses, setShowAllAIResponses] = useState(false);
  const [showAllSubmissions, setShowAllSubmissions] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    activities: [],
    activityStats: {},
    recentSubmissions: [],
    students: [],
    enrollments: [],
    recentLogins: [],
    studentDeliverables: {},
    unreadComments: [],
    aiCoachResponses: [],
    stats: {
      totalCourses: 0,
      totalStudents: 0,
      pendingReviews: 0,
      completedDeliverables: 0,
      averageProgress: 0,
      activeStudentsToday: 0
    }
  });
  const currentUserId = useSelector((state) => state.user?.user?.Id || 1);
const loadDashboardData = async () => {
    try {
      setError("")
      setLoading(true)

const [user, activities, activityStats, submissions, students, enrollments, recentLogins, allComments, aiCoaches] = await Promise.all([
        userService.getById(currentUserId),
        activityService.getRecentActivity(8),
        activityService.getActivityStats(),
        submissionService.getAll(),
        userService.getByRole("student"),
        enrollmentService.getAll(),
        userService.getRecentLogins(10),
        Promise.all(
          (await submissionService.getAll()).map(async (submission) => {
            const comments = await commentService.getBySubmissionId(submission.Id);
            return comments.map(comment => ({ ...comment, submissionId: submission.Id }));
          })
        ).then(results => results.flat()),
        aiCoachService.getAll()
])

      setCurrentUser(user);

      // Calculate student deliverables count
      const studentDeliverables = {};
      students.forEach(student => {
        const studentSubmissions = submissions.filter(s => s.studentId === student.Id);
        studentDeliverables[student.Id] = {
          total: studentSubmissions.length,
          pending: studentSubmissions.filter(s => s.status === "pending").length,
          approved: studentSubmissions.filter(s => s.status === "approved").length,
          changes: studentSubmissions.filter(s => s.status === "changes_requested").length
        };
      });

      // Calculate average progress
      const validEnrollments = enrollments.filter(e => e.progress?.overallProgress != null);
      const averageProgress = validEnrollments.length > 0 
        ? Math.round(validEnrollments.reduce((sum, e) => sum + (e.progress.overallProgress || 0), 0) / validEnrollments.length)
        : 0;

      // Get unread comments (simplified - in real app would track read status)
const unreadComments = allComments
        .filter(comment => comment.authorId !== currentUserId)
        .slice(0, 5)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      // Mock AI Coach Responses data with realistic interactions
      const aiCoachResponses = [
        {
          Id: 1,
          studentId: 2,
          studentName: "John Smith",
          coachId: 1,
          coachName: "Marketing Assistant",
          question: "How do I create an effective email marketing campaign?",
          aiResponse: "To create an effective email marketing campaign, focus on these key elements: 1) Define your target audience and segment your list, 2) Craft compelling subject lines with 30-50% open rates, 3) Personalize content based on user behavior, 4) Include clear call-to-action buttons, 5) Test send times and A/B test different versions. Would you like me to elaborate on any of these points?",
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          status: "ai_responded",
          isUserOverride: false,
          courseTitle: "Digital Marketing Fundamentals"
        },
        {
          Id: 2,
          studentId: 3,
          studentName: "Sarah Johnson",
          coachId: 2,
          coachName: "Data Analysis Coach",
          question: "What's the best way to visualize customer churn data?",
          aiResponse: "For customer churn visualization, I recommend: 1) Cohort analysis charts to track retention over time, 2) Funnel charts showing drop-off points, 3) Heat maps for behavioral patterns, 4) Survival curves for time-to-churn analysis. The key is choosing visualizations that tell a clear story about why customers leave.",
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          status: "ai_responded",
          isUserOverride: false,
          courseTitle: "Data Analytics Pro"
        },
        {
          Id: 3,
          studentId: 4,
          studentName: "Mike Chen",
          coachId: 1,
          coachName: "Marketing Assistant",
          question: "Should I use Facebook or Google Ads for my product launch?",
          aiResponse: "The choice between Facebook and Google Ads depends on your goals and audience. Google Ads work best for high-intent searches when people are actively looking for solutions. Facebook Ads excel at creating awareness and targeting specific demographics. For product launches, I'd recommend starting with Google Ads for immediate conversions, then adding Facebook for broader reach.",
          userResponse: "I'd actually recommend starting with a small budget on both platforms simultaneously. This allows you to gather data on where your specific audience responds best, rather than making assumptions. Run them for 2 weeks, then double down on the winner.",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: "user_override",
          isUserOverride: true,
          courseTitle: "Digital Marketing Fundamentals"
        },
        {
          Id: 4,
          studentId: 5,
          studentName: "Emma Davis",
          coachId: 3,
          coachName: "UX Design Coach",
          question: "How do I improve the user flow in my mobile app?",
          aiResponse: "To improve mobile app user flow: 1) Map the current user journey and identify friction points, 2) Reduce the number of steps to complete key actions, 3) Use progressive disclosure to avoid overwhelming users, 4) Implement clear navigation patterns, 5) Add micro-interactions for feedback. Consider using tools like Hotjar or FullStory to see actual user behavior.",
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          status: "ai_responded",
          isUserOverride: false,
          courseTitle: "UX Design Mastery"
        },
        {
          Id: 5,
          studentId: 6,
          studentName: "Alex Thompson",
          coachId: 2,
          coachName: "Data Analysis Coach",
          question: "How do I handle missing data in my analysis?",
          aiResponse: "Missing data handling depends on the context and amount: 1) For <5% missing randomly: simple deletion is often fine, 2) For systematic missing data: investigate the cause first, 3) Use mean/median imputation for numerical data, mode for categorical, 4) Consider advanced methods like KNN imputation or multiple imputation, 5) Always document your approach and test sensitivity to different methods.",
          userResponse: "Great points from the AI! I'd add that you should also consider the business impact of each approach. Sometimes it's better to exclude incomplete records entirely if the missing data could significantly bias your conclusions. Also, create a 'missingness indicator' variable - sometimes the fact that data is missing is itself informative.",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          status: "user_override",
          isUserOverride: true,
          courseTitle: "Data Analytics Pro"
        },
        {
          Id: 6,
          studentId: 7,
          studentName: "Lisa Wang",
          coachId: 3,
          coachName: "UX Design Coach",
          question: "What color scheme works best for a fintech app?",
          aiResponse: "For fintech apps, color psychology is crucial: 1) Blue conveys trust and stability (used by most banks), 2) Green suggests growth and money, 3) White/gray creates clean, professional feel, 4) Avoid red as it can signal alerts/danger, 5) Use high contrast for accessibility. Consider your brand personality - are you traditional (blues) or innovative (teals/purples)?",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: "ai_responded",
          isUserOverride: false,
          courseTitle: "UX Design Mastery"
        }
      ];

      const stats = {
        totalCourses: enrollments.length,
        totalStudents: students.length,
        pendingReviews: submissions.filter(s => s.status === "pending").length,
        completedDeliverables: submissions.filter(s => s.status === "approved").length,
        averageProgress,
        activeStudentsToday: recentLogins.filter(login => 
          new Date(login.lastLoginAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length
      }

setDashboardData({
        activities,
        activityStats,
recentSubmissions: submissions.slice(0, 3),
        students: students.slice(0, 8),
        enrollments,
        recentLogins,
        studentDeliverables,
        unreadComments,
        aiCoachResponses,
        stats
      });

    } catch (err) {
      console.error("Failed to load dashboard data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  if (loading) return <Loading type="skeleton" />
  if (error) return <Error message={error} onRetry={loadDashboardData} />

  const StatCard = ({ title, value, icon, gradient, change }) => (
<Card className="overflow-hidden bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">
              {value}
            </p>
            {change && (
              <p className="text-sm text-success-600 mt-1">
                <ApperIcon name="TrendingUp" className="h-4 w-4 inline mr-1" />
                {change}
              </p>
            )}
          </div>
          <div className={`h-14 w-14 rounded-lg ${gradient.replace('bg-gradient-to-br', 'bg')} flex items-center justify-center`}>
            <ApperIcon name={icon} className="h-7 w-7 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

return (
    <div className="p-6 space-y-8">
    {/* Header */}
    <div className="space-y-4">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {currentUser?.name || "User"}!
                          </h1>
            <p className="text-gray-600">Here's what's happening in your learning platform today.
                          </p>
        </div>
        {/* Quick Search */}
        <div className="max-w-xl">
            <SearchBar
                placeholder="Search across all course content..."
                enableSemantic={true}
                className="w-full" />
        </div>
    </div>
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
            title="Total Courses"
            value={dashboardData.stats.totalCourses}
            icon="BookOpen"
            gradient="bg-primary-600"
            change="+2 this month" />
        <StatCard
            title="Active Students"
            value={dashboardData.stats.totalStudents}
            icon="Users"
            gradient="bg-secondary-600"
            change="+12% this week" />
        <StatCard
            title="Pending Reviews"
            value={dashboardData.stats.pendingReviews}
            icon="MessageSquare"
            gradient="bg-warning-600"
            change="2 urgent" />
        <StatCard
            title="Deliverables"
            value={dashboardData.stats.completedDeliverables}
            icon="Award"
            gradient="bg-success-600"
            change="+8 this week" />
        <StatCard
            title="Avg Progress"
            value={`${dashboardData.stats.averageProgress}%`}
            icon="TrendingUp"
            gradient="bg-accent-600"
            change={`${dashboardData.stats.activeStudentsToday} active today`} />
    </div>
    {/* Quick Actions */}
    <Card className="mb-8">
        <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                    variant="outline"
                    size="lg"
                    className="h-20 flex-col"
                    onClick={() => navigate("/courses/new")}>
                    <ApperIcon name="Plus" className="h-6 w-6 mb-2" />Create Course
                                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    className="h-20 flex-col"
                    onClick={() => navigate("/students")}>
                    <ApperIcon name="UserPlus" className="h-6 w-6 mb-2" />Add Student
                                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    className="h-20 flex-col"
                    onClick={() => navigate("/reviews")}>
                    <ApperIcon name="Eye" className="h-6 w-6 mb-2" />Review Submissions
                                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    className="h-20 flex-col"
                    onClick={() => navigate("/deliverables")}>
                    <ApperIcon name="Award" className="h-6 w-6 mb-2" />View Deliverables
                                </Button>
            </div>
        </CardContent>
    </Card>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Platform activity since your last login</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                            <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2" />Refresh
                                            </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {dashboardData.activities.length === 0 ? <div className="text-center py-8">
                    <ApperIcon name="Activity" className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No recent activity to display</p>
                    <p className="text-sm text-gray-400">Activity will appear here as users interact with the platform</p>
                </div> : <div className="space-y-4">
                    {dashboardData.activities.map((activity, index) => {
                        const getActivityColor = type => {
                            switch (type) {
                            case "submission":
                                return "bg-blue-600";
                            case "login":
                                return "bg-green-600";
                            case "payment":
                                return "bg-purple-600";
                            case "enrollment":
                                return "bg-orange-600";
                            default:
                                return "bg-gray-600";
                            }
                        };

                        return (
                            <motion.div
                                key={activity.Id}
                                initial={{
                                    opacity: 0,
                                    x: -20
                                }}
                                animate={{
                                    opacity: 1,
                                    x: 0
                                }}
                                transition={{
                                    delay: index * 0.1
                                }}
                                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <div
                                    className={`h-10 w-10 ${getActivityColor(activity.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                    <ApperIcon name={activity.icon} className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                            {activity.title}
                                        </h4>
                                        <span className="text-xs text-gray-500 flex-shrink-0">
                                            {getTimeAgo(activity.timestamp)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                        {activity.description}
                                    </p>
                                    <div className="flex items-center mt-2 space-x-3">
                                        {activity.user && <UserAvatar user={activity.user} size="sm" className="flex-shrink-0" />}
                                        {activity.status && <StatusBadge status={activity.status} type={activity.type} size="sm" />}
                                        {activity.metadata?.amount && <span className="text-xs font-medium text-green-600">${activity.metadata.amount}
                                        </span>}
                                    </div>
                                </div>
                            </motion.div>
                        );
}).slice(0, showAllActivities ? dashboardData.activities.length : 3)}
{dashboardData.activities.length > 3 && <div className="pt-3 border-t border-gray-100">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAllActivities(!showAllActivities)}
                            className="w-full justify-center">
                            <ApperIcon
                                name={showAllActivities ? "ChevronUp" : "ChevronDown"}
                                className="h-4 w-4 mr-2" />
                            {showAllActivities ? "Show less" : `Show more (${dashboardData.activities.length - 3} remaining)`}
                        </Button>
                    </div>}
                    <div className="pt-3 border-t border-gray-100 mt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <div className="text-lg font-semibold text-blue-600">
                                    {dashboardData.activityStats.todaySubmissions || 0}
                                </div>
                                <div className="text-xs text-gray-500">Submissions Today</div>
                            </div>
                            <div>
                                <div className="text-lg font-semibold text-green-600">
                                    {dashboardData.activityStats.todayLogins || 0}
                                </div>
                                <div className="text-xs text-gray-500">Logins Today</div>
                            </div>
                            <div>
                                <div className="text-lg font-semibold text-purple-600">
                                    {dashboardData.activityStats.todayPayments || 0}
                                </div>
                                <div className="text-xs text-gray-500">Payments Today</div>
                            </div>
                            <div>
                                <div className="text-lg font-semibold text-orange-600">
                                    {dashboardData.activityStats.todayEnrollments || 0}
                                </div>
                                <div className="text-xs text-gray-500">New Members Today</div>
                            </div>
                        </div>
                    </div>
                </div>}
            </CardContent>
        </Card>
        {/* Recent Submissions */}
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Recent Submissions</CardTitle>
                        <CardDescription>Latest student work</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate("/reviews")}>Review All
                                      </Button>
                </div>
            </CardHeader>
<CardContent className="space-y-4">
                {dashboardData.recentSubmissions.slice(0, showAllSubmissions ? dashboardData.recentSubmissions.length : 3).map((submission, index) => <motion.div
                    key={submission.Id}
                    initial={{
                        opacity: 0,
                        y: 20
                    }}
                    animate={{
                        opacity: 1,
                        y: 0
                    }}
                    transition={{
                        delay: index * 0.1
                    }}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-200 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                    onClick={() => navigate(`/submissions/${submission.Id}`)}>
                    <div className="flex items-center space-x-3">
                        <div
                            className="h-10 w-10 bg-accent-600 rounded-lg flex items-center justify-center">
                            <ApperIcon name="FileText" className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900">Lesson {submission.lessonId}Submission
                                                    </h4>
                            <p className="text-sm text-gray-500">Student {submission.studentId}• {new Date(submission.submittedAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <StatusBadge status={submission.status} type="submission" />
                </motion.div>)}
                {dashboardData.recentSubmissions.length > 3 && <div className="pt-3 border-t border-gray-100">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllSubmissions(!showAllSubmissions)}
                        className="w-full justify-center">
                        <ApperIcon
                            name={showAllSubmissions ? "ChevronUp" : "ChevronDown"}
                            className="h-4 w-4 mr-2" />
                        {showAllSubmissions ? "Show less" : `Show more (${dashboardData.recentSubmissions.length - 3} remaining)`}
                    </Button>
                </div>}
            </CardContent>
        </Card>
    </div>
    {/* Students Overview */}
    {/* Student Progress Overview */}
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Student Progress Overview</CardTitle>
                    <CardDescription>Track individual student progress and completion</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/students")}>
                    <ApperIcon name="Users" className="h-4 w-4 mr-2" />View All
                                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.students.map((student, index) => {
                    const enrollment = dashboardData.enrollments.find(e => e.userId === student.Id);
                    const progress = enrollment?.progress?.overallProgress || 0;
                    const currentLesson = enrollment?.progress?.currentLesson || "Not started";

                    return (
                        <motion.div
                            key={student.Id}
                            initial={{
                                opacity: 0,
                                y: 20
                            }}
                            animate={{
                                opacity: 1,
                                y: 0
                            }}
                            transition={{
                                delay: index * 0.1
                            }}
                            className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:border-gray-200 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                            onClick={() => navigate(`/students/${student.Id}`)}>
                            <UserAvatar user={student} size="md" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">{student.name}</h4>
                                <p className="text-sm text-gray-500 truncate">{currentLesson}</p>
                                <div className="flex items-center mt-1">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                                        <div
                                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${progress}%`
                                            }} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600">{progress}%</span>
                                </div>
                            </div>
                            <ProgressRing progress={progress} size={40} strokeWidth={3} />
                        </motion.div>
                    );
                })}
            </div>
        </CardContent>
    </Card>
    {/* Recent Student Activity */}
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Recent Student Activity</CardTitle>
                    <CardDescription>Last student sign-ins and activity status</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/students")}>
                    <ApperIcon name="Activity" className="h-4 w-4 mr-2" />View Details
                                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
                {dashboardData.recentLogins.slice(0, 6).map((student, index) => {
                    const isActiveToday = student.lastLoginAt && new Date(student.lastLoginAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);
                    const lastSeen = student.lastLoginAt ? getTimeAgo(student.lastLoginAt) : "Never";

                    return (
                        <motion.div
                            key={student.Id}
                            initial={{
                                opacity: 0,
                                x: -20
                            }}
                            animate={{
                                opacity: 1,
                                x: 0
                            }}
                            transition={{
                                delay: index * 0.05
                            }}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <UserAvatar user={student} size="sm" />
                                    <div
                                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${isActiveToday ? "bg-green-500" : "bg-gray-400"}`} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{student.name}</p>
                                    <p className="text-sm text-gray-500">Last seen: {lastSeen}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <StatusBadge
                                    status={isActiveToday ? "active" : "inactive"}
                                    text={isActiveToday ? "Active" : "Inactive"} />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </CardContent>
    </Card>
    {/* Student Deliverables Summary */}
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Student Deliverables</CardTitle>
                    <CardDescription>Track submissions and deliverables from each student</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/deliverables")}>
                    <ApperIcon name="Package" className="h-4 w-4 mr-2" />View All
                                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {dashboardData.students.map((student, index) => {
                    const deliverables = dashboardData.studentDeliverables[student.Id] || {
                        total: 0,
                        pending: 0,
                        approved: 0,
                        changes: 0
                    };

                    return (
                        <motion.div
                            key={student.Id}
                            initial={{
                                opacity: 0,
                                scale: 0.95
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1
                            }}
                            transition={{
                                delay: index * 0.05
                            }}
                            className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-200 hover:bg-gray-50 transition-all duration-200">
                            <div className="flex items-center space-x-3">
                                <UserAvatar user={student} size="sm" />
                                <div>
                                    <p className="font-medium text-gray-900">{student.name}</p>
                                    <p className="text-sm text-gray-500">{deliverables.total}total submissions</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-warning-600">{deliverables.pending}</div>
                                    <div className="text-xs text-gray-500">Pending</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-success-600">{deliverables.approved}</div>
                                    <div className="text-xs text-gray-500">Approved</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-error-600">{deliverables.changes}</div>
                                    <div className="text-xs text-gray-500">Changes</div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate(`/students/${student.Id}/submissions`)}>
                                    <ApperIcon name="ExternalLink" className="h-4 w-4" />
                                </Button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </CardContent>
    </Card>
    {/* Unread Messages */}
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Unread Messages</CardTitle>
                    <CardDescription>Recent unread comments and conversations</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/chat")}>
                    <ApperIcon name="MessageCircle" className="h-4 w-4 mr-2" />View All
                                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
                {dashboardData.unreadComments.length === 0 ? <div className="text-center py-8">
                    <ApperIcon name="MessageSquare" className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No unread messages</p>
                </div> : dashboardData.unreadComments.map((comment, index) => {
                    const author = dashboardData.students.find(s => s.Id === comment.authorId) || {
                        name: "Unknown User",
                        Id: comment.authorId
                    };

                    return (
                        <motion.div
                            key={comment.Id}
                            initial={{
                                opacity: 0,
                                y: 10
                            }}
                            animate={{
                                opacity: 1,
                                y: 0
                            }}
                            transition={{
                                delay: index * 0.05
                            }}
                            className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                            onClick={() => {
                                navigate(`/submissions/${comment.submissionId}`);
                                toast.success("Navigated to conversation");
                            }}>
                            <UserAvatar user={author} size="sm" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="font-medium text-gray-900">{author.name}</p>
                                    <span className="text-xs text-gray-500">{getTimeAgo(comment.createdAt)}</span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">{comment.text}</p>
                                <div className="flex items-center mt-2">
                                    <div className="w-2 h-2 bg-primary-600 rounded-full mr-2" />
                                    <span className="text-xs text-primary-700 font-medium">Unread</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </CardContent>
    </Card>
    {/* AI Coach Responses Section */}
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <ApperIcon name="Brain" className="h-5 w-5 text-primary-600" />AI Coach Responses
                                      </CardTitle>
                    <CardDescription>Monitor AI coach interactions and provide human oversight</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-500">
                        {dashboardData.aiCoachResponses.filter(r => !r.isUserOverride).length}AI • {dashboardData.aiCoachResponses.filter(r => r.isUserOverride).length}User
                                      </div>
                    <Button variant="outline" size="sm" onClick={() => navigate("/ai-coaches")}>
                        <ApperIcon name="Settings" className="h-4 w-4 mr-2" />Manage Coaches
                                      </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            {dashboardData.aiCoachResponses.length === 0 ? <div className="text-center py-8">
                <ApperIcon name="MessageSquare" className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No AI coach responses yet</p>
                <p className="text-sm text-gray-400">AI responses will appear here as students interact with coaches</p>
            </div> : <div className="space-y-4">
                {dashboardData.aiCoachResponses.slice(0, showAllAIResponses ? dashboardData.aiCoachResponses.length : 4).map((response, index) => <motion.div
                    key={response.Id}
                    initial={{
                        opacity: 0,
                        y: 20
                    }}
                    animate={{
                        opacity: 1,
                        y: 0
                    }}
                    transition={{
                        delay: index * 0.1
                    }}
                    className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 hover:bg-gray-50 transition-all duration-200">
                    {/* Header with student and coach info */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            <UserAvatar
                                user={{
                                    name: response.studentName,
                                    Id: response.studentId
                                }}
                                size="sm" />
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-gray-900">{response.studentName}</h4>
                                    <ApperIcon name="ArrowRight" className="h-3 w-3 text-gray-400" />
                                    <span className="text-sm text-primary-600 font-medium">{response.coachName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>{response.courseTitle}</span>
                                    <span>•</span>
                                    <span>{getTimeAgo(response.timestamp)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {response.isUserOverride ? <div
                                className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                <ApperIcon name="User" className="h-3 w-3" />User Override
                                                        </div> : <div
                                className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                <ApperIcon name="Brain" className="h-3 w-3" />AI Response
                                                        </div>}
                        </div>
                    </div>
                    {/* Student Question */}
                    <div className="mb-3">
                        <div className="text-xs font-medium text-gray-500 mb-1">STUDENT QUESTION:</div>
                        <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg italic">"{response.question}"
                                                </div>
                    </div>
                    {/* AI Response */}
                    {!response.isUserOverride && <div className="mb-3">
                        <div className="text-xs font-medium text-gray-500 mb-1">AI COACH RESPONSE:</div>
                        <div
                            className="text-sm text-gray-700 bg-primary-50 p-3 rounded-lg border-l-4 border-primary-200">
                            {response.aiResponse}
                        </div>
                    </div>}
                    {/* User Override Response */}
                    {response.isUserOverride && response.userResponse && <div className="mb-3">
                        <div className="text-xs font-medium text-gray-500 mb-1">YOUR RESPONSE (OVERRIDING AI):</div>
                        <div
                            className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-200">
                            {response.userResponse}
                        </div>
                        {response.aiResponse && <details className="mt-2">
                            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">View original AI response
                                                          </summary>
                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mt-2 border">
                                {response.aiResponse}
                            </div>
                        </details>}
                    </div>}
                    {/* Action buttons */}
                    <div
                        className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    navigate(`/ai-coach-chat/${response.studentId}/${response.Id}`);
                                    toast.success("Opened AI coach conversation");
                                }}
                                className="text-xs">
                                <ApperIcon name="MessageCircle" className="h-3 w-3 mr-1" />View Chat
                                                      </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    navigator.clipboard.writeText(response.question);
                                    toast.success("Question copied to clipboard");
                                }}
                                className="text-xs">
                                <ApperIcon name="Copy" className="h-3 w-3 mr-1" />Copy Question
                                                      </Button>
                        </div>
                        {!response.isUserOverride && <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                navigate(`/ai-coach-chat/${response.studentId}/${response.Id}?takeover=true`);

                                const updatedResponses = dashboardData.aiCoachResponses.map(r => r.Id === response.Id ? {
                                    ...r,
                                    isUserOverride: true,
                                    status: "user_override",
                                    userResponse: "User is now handling this conversation directly."
                                } : r);

                                setDashboardData(prev => ({
                                    ...prev,
                                    aiCoachResponses: updatedResponses
                                }));

                                toast.success("Taking over conversation - opening AI coach chat");
                            }}
                            className="text-xs">
                            <ApperIcon name="User" className="h-3 w-3 mr-1" />Take Over
                                                  </Button>}
                    </div>
                </motion.div>)}
                {dashboardData.aiCoachResponses.length > 4 && <div className="pt-3 border-t border-gray-100">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllAIResponses(!showAllAIResponses)}
                        className="w-full justify-center">
                        <ApperIcon
                            name={showAllAIResponses ? "ChevronUp" : "ChevronDown"}
                            className="h-4 w-4 mr-2" />
                        {showAllAIResponses ? "Show less" : `Show more (${dashboardData.aiCoachResponses.length - 4} remaining)`}
                    </Button>
                </div>}
                {/* AI Coach Activity Summary */}
                <div className="pt-3 border-t border-gray-100 mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-lg font-semibold text-green-600">
                                {dashboardData.aiCoachResponses.filter(r => !r.isUserOverride).length}
                            </div>
                            <div className="text-xs text-gray-500">AI Handled</div>
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-blue-600">
                                {dashboardData.aiCoachResponses.filter(r => r.isUserOverride).length}
                            </div>
                            <div className="text-xs text-gray-500">User Override</div>
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-purple-600">
                                {new Set(dashboardData.aiCoachResponses.map(r => r.studentId)).size}
                            </div>
                            <div className="text-xs text-gray-500">Students Helped</div>
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-orange-600">
                                {dashboardData.aiCoachResponses.filter(r => new Date(r.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
                            </div>
                            <div className="text-xs text-gray-500">Today</div>
                        </div>
                    </div>
                </div>
            </div>}
        </CardContent>
    </Card>
</div>
  )
}

export default Dashboard