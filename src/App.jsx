import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import React from "react";
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
function App() {
  return (
    <BrowserRouter>
<div className="min-h-screen bg-white">
        <Routes>
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
      </div>
      
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
    </BrowserRouter>
  )
}

export default App