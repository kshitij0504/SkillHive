import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landinpage/landing";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/signup";
import Verifyotp from "./pages/auth/verify-otp";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/Dashboard/homepage";
import CoursePage from "./pages/Dashboard/coursepage";
import AllCoursesPage from "./pages/Dashboard/allcoursepage";
import InstructorDashboard from "./pages/Instructor/dashboard";
import EditCoursePage from "./pages/Instructor/editcoursepage";
import CreateCoursePage from "./pages/Instructor/createcourse";
function App() {
  return (
    <GoogleOAuthProvider clientId="987073033254-ncio94d9j7ls25lkos2esp8p824l26ta.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/verify" element={<Verifyotp />} />
          <Route path="/courses/:courseId" element={<CoursePage />} />
          <Route path="/course/allcourse" element={<AllCoursesPage />} />
          <Route path="/instructor/dashboard" element={<InstructorDashboard />} /> 
          <Route path="/instructor/course/:courseId/edit" element={<EditCoursePage />} />
          <Route path="/instructor/create" element={<CreateCoursePage />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#fff',
              color: '#333',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            },
            success: {
              style: {
                borderColor: '#10b981',
              },
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              style: {
                borderColor: '#ef4444',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
