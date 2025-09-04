import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import React from "react";
import "@/index.css";
import Layout from "@/components/organisms/Layout";
import AICoachManager from "@/components/pages/AICoachManager";
import StudentList from "@/components/pages/StudentList";
import CourseBuilder from "@/components/pages/CourseBuilder";
import CourseBundleBuilder from "@/components/pages/CourseBundleBuilder";
import CustomDomain from "@/components/pages/CustomDomain";
import CourseList from "@/components/pages/CourseList";
import BusinessDetails from "@/components/pages/BusinessDetails";
import NotificationSettings from "@/components/pages/NotificationSettings";
import SemanticSearch from "@/components/pages/SemanticSearch";
import ReviewInbox from "@/components/pages/ReviewInbox";
import Dashboard from "@/components/pages/Dashboard";
import CoursePlayer from "@/components/pages/CoursePlayer";
import Integrations from "@/components/pages/Integrations";
import StudentProgress from "@/components/pages/StudentProgress";
import DeliverablesBoard from "@/components/pages/DeliverablesBoard";
import Account from "@/components/pages/Account";
import Chat from "@/components/pages/Chat";
import TaskList from "@/components/pages/TaskList";
import SubmissionDetail from "@/components/pages/SubmissionDetail";
import PlansAndBilling from "@/components/pages/PlansAndBilling";

function App() {
  return (
      <BrowserRouter>
<div className="min-h-screen bg-white transition-colors">
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
            theme="colored"
            style={{ zIndex: 9999 }}
          />
        </div>
      </BrowserRouter>
  );
}

export default App;