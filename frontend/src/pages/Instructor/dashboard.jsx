import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  AcademicCapIcon,
  CurrencyRupeeIcon,
  UsersIcon,
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  XCircleIcon, // ENHANCEMENT: For error messages
  SparklesIcon, // ENHANCEMENT: For welcome message or highlights
} from "@heroicons/react/24/outline";

import Layout from "../Dashboard/layout"; // Assuming Layout provides a good base (e.g., nav, footer)
import CourseCard from "../../components/Coursers/CourseCard";

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    coursePerformance: [],
  });
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null); // ENHANCEMENT: Clear previous errors on new fetch

        const userResponse = await axios.get("http://localhost:5000/auth/current", {
          withCredentials: true,
        });
        const userData = userResponse.data.data;
        if (userData.role !== "INSTRUCTOR") {
          toast.error("Access restricted to instructors only.");
          navigate("/dashboard");
          return;
        }
        setUser(userData);

        const analyticsResponse = await axios.get(
          "http://localhost:5000/course/analytics",
          { withCredentials: true }
        );
        setAnalytics(analyticsResponse.data.data);

        const coursesResponse = await axios.get(
          "http://localhost:5000/course/courses",
          { withCredentials: true }
        );
        setCourses(coursesResponse.data.data.courses);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        const errorMessage = err.response?.data?.message || "Failed to load dashboard data. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage); // ENHANCEMENT: Show toast for API errors
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <Layout>
        {/* ENHANCEMENT: More engaging loading state */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] bg-slate-50 text-slate-700">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-sky-600 mb-6"></div>
          <p className="text-2xl font-semibold mb-2">Loading Your Dashboard</p>
          <p className="text-slate-500">Hang tight, we're preparing your workspace...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        {/* ENHANCEMENT: More user-friendly error display */}
        <div className="max-w-3xl mx-auto mt-12 px-4 sm:px-6 lg:px-8 py-12 bg-red-50 rounded-xl shadow-lg border border-red-200">
          <div className="text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-6"/>
            <h2 className="text-3xl font-bold text-red-700 mb-4">
              Oops! Something Went Wrong
            </h2>
            <p className="text-red-600 mb-6 text-lg">{error}</p>
            <p className="text-slate-500 mb-8">
              Please try refreshing the page. If the problem persists, contact support.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-red-50"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* ENHANCEMENT: Added a subtle background to the page if Layout doesn't provide one */}
      <div className="bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 sm:space-y-20"> {/* ENHANCEMENT: Increased py and space-y */}

          {/* Header Section */}
          {/* ENHANCEMENT: Refined gradient, softer shadow, slightly more padding */}
          <section className="bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl sm:rounded-2xl p-6 sm:p-10 shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                   <SparklesIcon className="h-10 w-10 text-amber-400" />
                  <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                    Welcome back, {user?.name?.split(' ')[0] || "Instructor"}! {/* Show first name */}
                  </h1>
                </div>
                <p className="text-sky-100 text-base sm:text-lg max-w-2xl">
                  Here's your command center for creating, managing, and tracking your courses on SkillHive.
                </p>
              </div>
              <button
                onClick={() => navigate("/instructor/create")}
                className="mt-4 md:mt-0 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-lg font-semibold flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-indigo-600"
              >
                <PlusCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                Create New Course
              </button>
            </div>
          </section>

          {/* Analytics Overview Section */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 mb-6 sm:mb-8">Your Analytics Overview</h2>
            {/* ENHANCEMENT: Softer shadows, hover effects, consistent styling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                { title: "Total Courses", value: analytics.totalCourses, icon: AcademicCapIcon, color: "sky" },
                { title: "Total Enrollments", value: analytics.totalEnrollments, icon: UsersIcon, color: "teal" },
                { title: "Total Revenue", value: `₹${analytics.totalRevenue.toFixed(2)}`, icon: CurrencyRupeeIcon, color: "emerald" },
                {
                  title: "Avg. Completion",
                  value: `${analytics.coursePerformance.length > 0
                      ? (
                          analytics.coursePerformance.reduce(
                            (sum, course) => sum + parseFloat(course.completionRate || 0), 0
                          ) / analytics.coursePerformance.length
                        ).toFixed(1)
                      : 0
                    }%`,
                  icon: ChartBarIcon, color: "purple"
                },
              ].map((item, index) => (
                <div
                  key={index}
                  // ENHANCEMENT: Card styling - softer background, distinct icon bg, hover effect
                  className="bg-white p-6 rounded-xl shadow-lg border border-slate-200/80 flex flex-col items-start transition-all duration-300 hover:shadow-xl hover:border-slate-300 transform hover:-translate-y-1"
                >
                  <div className={`p-3 bg-${item.color}-100 rounded-lg mb-4`}> {/* ENHANCEMENT: Dynamic icon bg color */}
                    <item.icon className={`h-7 w-7 text-${item.color}-600`} />
                  </div>
                  <p className="text-base text-slate-600 font-medium">{item.title}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Your Courses Section (Active Courses) */}
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 flex items-center gap-3">
                <ClipboardDocumentListIcon className="h-7 w-7 text-sky-600" /> Your Active Courses
              </h2>
              {/* ENHANCEMENT: Subtle "View All" or "Manage Courses" link if many courses */}
              {courses.length > 3 && (
                 <button
                    onClick={() => navigate("/instructor/my-courses")} // Assuming a route like this
                    className="mt-3 sm:mt-0 text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
                 >
                    Manage All Courses
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                 </button>
              )}
            </div>

            {courses.length === 0 ? (
              // ENHANCEMENT: More inviting empty state
              <div className="text-center py-16 sm:py-24 bg-white rounded-xl shadow-lg border border-slate-200/80">
                <AcademicCapIcon className="h-20 w-20 sm:h-24 sm:w-24 text-slate-400 mx-auto mb-6" />
                <p className="text-slate-700 text-xl sm:text-2xl font-semibold mb-3">No Courses Found Yet</p>
                <p className="text-slate-500 mt-1 max-w-md mx-auto mb-8 text-base sm:text-lg">
                  It looks a bit empty here. Why not share your expertise and create your first course?
                </p>
                <button
                  onClick={() => navigate("/instructor/create-course")}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-7 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-white"
                >
                  Create Your First Course
                </button>
              </div>
            ) : (
              // ENHANCEMENT: Ensure consistent gap for better visual rhythm
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:gap-8"> {/* Changed xl:grid-cols-4 to 3 for potentially larger cards */}
                {/* ENHANCEMENT: Slicing to show a preview if many courses, if not using a "Manage All" link like above */}
                {courses.slice(0, 6).map((course) => ( // Example: Show up to 6 courses
                  <CourseCard
                    key={course.id}
                    courseId={course.id}
                    title={course.title}
                    image={course.imageUrl} // Ensure this is a valid URL
                    students={course.enrollments || 0} // Default to 0 if undefined
                    instructor={user?.name || "Instructor"}
                    rating={course.averageRating || 0} // Default to 0
                    price={course.price}
                    isApproved={course.isApproved}
                    instructorView={true}
                    // ENHANCEMENT: Pass additional props if CourseCard supports them for styling/badges
                    // e.g., category={course.category}, isNew={course.isNew}, status={course.status}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Call to Action */}
          {/* ENHANCEMENT: Modernized CTA with subtle parallax/hover effects if possible (CSS only here) */}
          <section className="py-12 sm:py-16">
            <div
              className="bg-slate-800 text-white rounded-xl sm:rounded-2xl p-8 sm:p-12 md:p-16 shadow-xl bg-cover bg-center overflow-hidden relative group"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80')", // More vibrant/relevant image
              }}
            >
              <div className="absolute inset-0 bg-slate-900 bg-opacity-60 group-hover:bg-opacity-70 transition-all duration-500 rounded-xl sm:rounded-2xl"></div>
              <div className="relative z-10 text-center">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-amber-400">
                  Ready to Inspire More Learners?
                </h2>
                <p className="text-slate-200 mb-8 max-w-2xl mx-auto text-lg sm:text-xl">
                  Expand your reach, share your passion, and make a difference. Create another engaging course today!
                </p>
                <button
                  onClick={() => navigate("/instructor/create-course")}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-8 py-3.5 rounded-lg font-semibold shadow-lg transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  Create Another Course
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default InstructorDashboard;