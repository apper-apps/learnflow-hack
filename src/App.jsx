import { createContext, useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import { setUser, clearUser } from "./store/userSlice";
import Login from "@/components/pages/Login";
import Signup from "@/components/pages/Signup";
import Callback from "@/components/pages/Callback";
import ErrorPage from "@/components/pages/ErrorPage";
import ResetPassword from "@/components/pages/ResetPassword";
import PromptPassword from "@/components/pages/PromptPassword";
import DeliverablesBoard from "@/components/pages/DeliverablesBoard";
import SubmissionDetail from "@/components/pages/SubmissionDetail";
import Chat from "@/components/pages/Chat";
import CourseBuilder from "@/components/pages/CourseBuilder";
import CourseBundleBuilder from "@/components/pages/CourseBundleBuilder";
import CourseList from "@/components/pages/CourseList";
import Dashboard from "@/components/pages/Dashboard";
import TaskList from "@/components/pages/TaskList";
import ReviewInbox from "@/components/pages/ReviewInbox";
import StudentList from "@/components/pages/StudentList";
import StudentProgress from "@/components/pages/StudentProgress";
import CoursePlayer from "@/components/pages/CoursePlayer";
import SemanticSearch from "@/components/pages/SemanticSearch";
import Account from "@/components/pages/Account";
import Integrations from "@/components/pages/Integrations";
import BusinessDetails from "@/components/pages/BusinessDetails";
import PlansAndBilling from "@/components/pages/PlansAndBilling";
import NotificationSettings from "@/components/pages/NotificationSettings";
import CustomDomain from "@/components/pages/CustomDomain";
import AICoachManager from "@/components/pages/AICoachManager";
import Layout from "@/components/organisms/Layout";

export const AuthContext = createContext(null);
function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  
  const userState = useSelector((state) => state.user);
  const isAuthenticated = userState?.isAuthenticated || false;
  
  useEffect(() => {
    const { ApperClient, ApperUI } = window.ApperSDK;
    
    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    ApperUI.setup(client, {
      target: '#authentication',
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: 'both',
      onSuccess: function (user) {
        setIsInitialized(true);
        let currentPath = window.location.pathname + window.location.search;
        let redirectPath = new URLSearchParams(window.location.search).get('redirect');
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || 
                           currentPath.includes('/callback') || currentPath.includes('/error') ||
                           currentPath.includes('/prompt-password') || currentPath.includes('/reset-password');
        
        if (user) {
          if (redirectPath) {
            navigate(redirectPath);
          } else if (!isAuthPage) {
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
              navigate(currentPath);
            } else {
              navigate('/');
            }
          } else {
            navigate('/');
          }
          dispatch(setUser(JSON.parse(JSON.stringify(user))));
        } else {
          if (!isAuthPage) {
            navigate(
              currentPath.includes('/signup')
                ? `/signup?redirect=${currentPath}`
                : currentPath.includes('/login')
                ? `/login?redirect=${currentPath}`
                : '/login'
            );
          } else if (redirectPath) {
            if (
              !['error', 'signup', 'login', 'callback', 'prompt-password', 'reset-password'].some((path) => currentPath.includes(path))
            ) {
              navigate(`/login?redirect=${redirectPath}`);
            } else {
              navigate(currentPath);
            }
          } else if (isAuthPage) {
            navigate(currentPath);
          } else {
            navigate('/login');
          }
          dispatch(clearUser());
        }
      },
      onError: function(error) {
        console.error("Authentication failed:", error);
      }
    });
  }, []);
  
  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK;
        await ApperUI.logout();
        dispatch(clearUser());
        navigate('/login');
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };
  
  if (!isInitialized) {
    return (
      <div className="loading flex items-center justify-center p-6 h-full w-full">
        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4"></path>
          <path d="m16.2 7.8 2.9-2.9"></path>
          <path d="M18 12h4"></path>
          <path d="m16.2 16.2 2.9 2.9"></path>
          <path d="M12 18v4"></path>
          <path d="m4.9 19.1 2.9-2.9"></path>
          <path d="M2 12h4"></path>
          <path d="m4.9 4.9 2.9 2.9"></path>
        </svg>
      </div>
    );
  }
  
  return (
    <AuthContext.Provider value={authMethods}>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/prompt-password/:appId/:emailAddress/:provider" element={<PromptPassword />} />
          <Route path="/reset-password/:appId/:fields" element={<ResetPassword />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="courses" element={<CourseList />} />
            <Route path="courses/new" element={<CourseBuilder />} />
            <Route path="courses/:courseId/edit" element={<CourseBuilder />} />
            <Route path="bundles/new" element={<CourseBundleBuilder />} />
            <Route path="bundles/:bundleId/edit" element={<CourseBundleBuilder />} />
            <Route path="courses/:courseId/play" element={<CoursePlayer />} />
            <Route path="courses/:courseId/play/:lessonId" element={<CoursePlayer />} />
            <Route path="course/:courseUrl" element={<CoursePlayer />} />
            <Route path="search" element={<SemanticSearch />} />
            <Route path="students" element={<StudentList />} />
            <Route path="students/:studentId/progress" element={<StudentProgress />} />
            <Route path="chat/:studentId" element={<Chat />} />
            <Route path="chat" element={<Chat />} />
            <Route path="ai-coach-chat/:studentId/:responseId" element={<Chat />} />
            <Route path="reviews" element={<ReviewInbox />} />
            <Route path="submissions/:submissionId" element={<SubmissionDetail />} />
            <Route path="deliverables" element={<DeliverablesBoard />} />
            <Route path="deliverables/kanban" element={<DeliverablesBoard />} />
            <Route path="tasks" element={<TaskList />} />
            <Route path="ai-coaches" element={<AICoachManager />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="account" element={<Account />} />
            <Route path="settings/business-details" element={<BusinessDetails />} />
            <Route path="settings/plans-billing" element={<PlansAndBilling />} />
            <Route path="settings/notifications" element={<NotificationSettings />} />
            <Route path="settings/custom-domain" element={<CustomDomain />} />
          </Route>
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 9999 }}
        />
      </div>
    </AuthContext.Provider>
  )
}
export default App