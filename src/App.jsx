import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import React from "react";
import DeliverablesBoard from "@/components/pages/DeliverablesBoard";
import SubmissionDetail from "@/components/pages/SubmissionDetail";
import CourseBuilder from "@/components/pages/CourseBuilder";
import CourseList from "@/components/pages/CourseList";
import Dashboard from "@/components/pages/Dashboard";
import TaskList from "@/components/pages/TaskList";
import ReviewInbox from "@/components/pages/ReviewInbox";
import StudentList from "@/components/pages/StudentList";
import CoursePlayer from "@/components/pages/CoursePlayer";
import SemanticSearch from "@/components/pages/SemanticSearch";
import Layout from "@/components/organisms/Layout";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="courses" element={<CourseList />} />
            <Route path="courses/new" element={<CourseBuilder />} />
<Route path="courses/:courseId/edit" element={<CourseBuilder />} />
            <Route path="courses/:courseId/play" element={<CoursePlayer />} />
            <Route path="courses/:courseId/play/:lessonId" element={<CoursePlayer />} />
            <Route path="course/:courseUrl" element={<CoursePlayer />} />
            <Route path="search" element={<SemanticSearch />} />
            <Route path="students" element={<StudentList />} />
            <Route path="reviews" element={<ReviewInbox />} />
<Route path="submissions/:submissionId" element={<SubmissionDetail />} />
            <Route path="deliverables" element={<DeliverablesBoard />} />
            <Route path="deliverables/kanban" element={<DeliverablesBoard />} />
            <Route path="tasks" element={<TaskList />} />
          </Route>
        </Routes>
      </div>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
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