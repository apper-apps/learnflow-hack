import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import Layout from "@/components/organisms/Layout"
import Dashboard from "@/components/pages/Dashboard"
import CourseBuilder from "@/components/pages/CourseBuilder"
import CourseList from "@/components/pages/CourseList"
import StudentList from "@/components/pages/StudentList"
import CoursePlayer from "@/components/pages/CoursePlayer"
import ReviewInbox from "@/components/pages/ReviewInbox"
import SubmissionDetail from "@/components/pages/SubmissionDetail"
import DeliverablesBoard from "@/components/pages/DeliverablesBoard"
import TaskList from "@/components/pages/TaskList"

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
            <Route path="students" element={<StudentList />} />
            <Route path="reviews" element={<ReviewInbox />} />
            <Route path="submissions/:submissionId" element={<SubmissionDetail />} />
            <Route path="deliverables" element={<DeliverablesBoard />} />
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