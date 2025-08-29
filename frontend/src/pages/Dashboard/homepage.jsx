import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "./layout"; 
import CourseCard from "../../components/Coursers/CourseCard";
import CategoryCard from "../../components/Coursers/CategoryCard";
import CommunityCard from "../../components/Coursers/CommunityCard"; 
import axios from "axios";

import {
  ComputerDesktopIcon,
  PaintBrushIcon,
  BriefcaseIcon,
  MegaphoneIcon,
  CameraIcon,
  MusicalNoteIcon,
  ArrowRightIcon, 
} from "@heroicons/react/24/outline"; 

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentEnrollment, setCurrentEnrollment] = useState(null);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [error, setError] = useState(null);

  const categoryIconMap = {
    Development: <ComputerDesktopIcon className="h-8 w-8 text-blue-600" />,
    Design: <PaintBrushIcon className="h-8 w-8 text-indigo-600" />,
    Business: <BriefcaseIcon className="h-8 w-8 text-emerald-600" />,
    Marketing: <MegaphoneIcon className="h-8 w-8 text-amber-600" />,
    Photography: <CameraIcon className="h-8 w-8 text-rose-600" />,
    Music: <MusicalNoteIcon className="h-8 w-8 text-purple-600" />,
    Default: <ComputerDesktopIcon className="h-8 w-8 text-gray-500" />,
  };

  const getUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/auth/me", { 
        withCredentials: true
      });
      console.log(res)
      setUser(res.data.user);
    } catch (error) {
      console.error("Error fetching user:", error.response?.data || error.message);
      setUser(null);
    }
  };

  const fetchCurrentEnrollment = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/course/enrollments/current",
        {
          withCredentials: true,
        }
      );
      console.log(res.data.data)
      setCurrentEnrollment(res.data.data);
    } catch (error) {
      console.error("Error fetching current enrollment:", error.response?.data || error.message);
      setCurrentEnrollment(null); // Keep null on error
    }
  };

  const fetchRecommendedCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/course/recommended");
      console.log(res)
      setRecommendedCourses(res.data.data.courses || []);
    } catch (error) {
      console.error("Error fetching recommended courses:", error.response?.data || error.message);
      setError("Failed to load recommended courses.");
      setRecommendedCourses([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/course/category", {
        withCredentials: true,
      });
      setCategories(res.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error.response?.data || error.message);
      setError("Failed to load categories."); 
      setCategories([]);
    }
  };
  const fetchCommunities = async () => {
    try {
      setCommunities([
        { id: 1, name: "React Developers Hangout", members: 1200, image: "https://via.placeholder.com/300x200?text=React+Community", topic: "ReactJS" },
        { id: 2, name: "UI/UX Mastery Group", members: 850, image: "https://via.placeholder.com/300x200?text=UI/UX+Community", topic: "Design" },
        { id: 3, name: "Python for Beginners", members: 2500, image: "https://via.placeholder.com/300x200?text=Python+Community", topic: "Python" },
      ]);
    } catch (error) {
      console.error("Error fetching communities:", error.response?.data || error.message);
      setCommunities([]);
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null); 
      await Promise.all([
        getUser(),
        fetchCurrentEnrollment(),
        fetchRecommendedCourses(),
        fetchCategories(),
        fetchCommunities(), 
      ]);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleCourseEnrollmentSuccess = (enrolledCourseId) => {
    console.log(`Successfully enrolled in course ${enrolledCourseId}. Refreshing data might be needed.`);
    fetchCurrentEnrollment();
    setRecommendedCourses(prev => prev.filter(course => course.id !== enrolledCourseId));
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen"> 
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      </Layout>
    );
  }
  
  if (error && !recommendedCourses.length && !categories.length) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto mt-10 px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Oops! Something went wrong.</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-gray-500">Please try refreshing the page or check back later.</p>
        </div>
      </Layout>
    );
  }


  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 md:space-y-24">
        <section className="bg-gradient-to-br from-blue-50 via-amber-50 to-rose-50 rounded-3xl p-8 sm:p-12 md:p-16 shadow-xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 md:w-96 md:h-96 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
              <path fill="#60A5FA" d="M53.1,-70.9C67.4,-63.9,76.5,-47.7,79.7,-30.7C82.9,-13.8,79.9,3.9,72.7,19.1C65.4,34.3,53.8,47.1,39.9,57.7C26.1,68.3,10.1,76.7,-6.9,79.2C-23.9,81.7,-42.1,78.3,-55.8,68.7C-69.5,59.1,-78.7,43.3,-80.9,26.6C-83.1,9.9,-78.3,-7.6,-69.6,-22.2C-60.9,-36.9,-48.3,-48.6,-34.7,-57.8C-21.1,-66.9,-6.6,-73.5,9.5,-76.9C25.6,-80.3,41.9,-77.9,53.1,-70.9Z" transform="translate(100 100) scale(1.1)" />
            </svg>
          </div>
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              {user
                ? <>Welcome back, <span className="text-blue-600">{user.name}</span>!</>
                : "Unlock Your Potential with SkillHive"}
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 mb-8">
              {user
                ? "Continue your learning journey and achieve your goals with our supportive community."
                : "Join thousands of learners mastering new skills through micro-courses and peer collaboration."}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4">
              {user ? (
                <>
                 <button
                    onClick={() =>
                      navigate(
                        currentEnrollment
                          ? `/courses/${currentEnrollment.courseId}`
                          : "/dashboard/my-courses" 
                      )
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
                    aria-label="Continue learning your current course or view my courses"
                  >
                    {currentEnrollment ? "Continue Learning" : "My Courses"}
                  </button>
                  <button
                    onClick={() => navigate("/courses")} // Link to the new All Courses page
                    className="bg-white hover:bg-blue-50 text-blue-600 px-8 py-3.5 rounded-xl font-semibold shadow-lg border border-blue-300 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-200"
                    aria-label="Discover new courses"
                  >
                    Discover New Courses
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-300"
                  >
                    Sign Up Free
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Continue Learning Section */}
        {user && currentEnrollment && (
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Pick Up Where You Left Off
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Your learning journey awaits.
            </p>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-2xl">
              <div className="md:flex">
                <div className="md:flex-shrink-0">
                  <img
                    className="h-56 w-full object-cover md:w-64"
                    src={currentEnrollment.imageUrl || `https://source.unsplash.com/random/400x220/?course,study,${currentEnrollment.courseId}`}
                    alt={currentEnrollment.courseTitle}
                  />
                </div>
                <div className="p-8 w-full">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="uppercase tracking-wide text-sm text-blue-600 font-semibold mb-1">
                        Your Current Course
                      </div>
                      <h3 className="mt-1 text-2xl font-semibold text-gray-900 hover:text-blue-700 transition-colors">
                        <Link to={`/courses/${currentEnrollment.courseId}`}>
                          {currentEnrollment.courseTitle}
                        </Link>
                      </h3>
                      {currentEnrollment.instructorName && ( // Assuming instructor name might be available
                        <p className="mt-2 text-gray-500">
                          Instructor: {currentEnrollment.instructorName}
                        </p>
                      )}
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                      {currentEnrollment.progress}% Complete
                    </span>
                  </div>
                  <div className="mt-4 mb-6">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${currentEnrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/courses/${currentEnrollment.courseId}`)
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center gap-2"
                  >
                    Resume Course <ArrowRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <section>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Recommended For You
              </h2>
              <p className="text-gray-600 text-lg">
                Handpicked courses to fuel your growth.
              </p>
            </div>
            <Link
              to="/course/allcourse"
              className="mt-3 sm:mt-0 text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 group transition-colors"
              aria-label="View all recommended courses"
            >
              View All
              <ArrowRightIcon className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {recommendedCourses.length === 0 && !error ? ( // Show message if no courses and no general error
             <div className="text-center py-10 bg-gray-50 rounded-lg">
                <ComputerDesktopIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No recommended courses available right now.</p>
                <p className="text-gray-500 mt-1">Explore other courses or update your interests!</p>
            </div>
          ) : recommendedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
              {recommendedCourses.slice(0, 3).map((course) => ( // Show top 3 for homepage
                <CourseCard
                  key={course.id}
                  title={course.title}
                  instructor={course.instructor?.name || "SkillHive Instructor"} 
                  image={course.imageUrl || `https://source.unsplash.com/random/400x220/?learning,code,${course.id}`}
                  rating={course.rating}
                  students={course.students}
                  price={course.price?.toString() || "Free"} 
                  tag={course.tag}
                  courseId={course.id}
                  user={user}
                />
              ))}
            </div>
          ) : null }
        </section>

        <section>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Explore Top Categories
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Dive into your interests or discover something new from our most popular categories.
            </p>
          </div>

          {categories.length === 0 && !error ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
                <PaintBrushIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" /> 
                <p className="text-gray-600 text-lg">Categories are currently unavailable.</p>
                <p className="text-gray-500 mt-1">Please check back soon!</p>
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {categories.slice(0,6).map((category) => ( 
                <CategoryCard
                  key={category.id}
                  icon={categoryIconMap[category.name] || <ComputerDesktopIcon className="h-8 w-8 text-gray-500" /> }
                  name={category.name}
                  count={category.courseCount || 0}
                  onClick={() => navigate(`/categories/${category.slug || category.id}`)} 
                />
              ))}
            </div>
          ) : null}
        </section>

        <section>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Join Our Thriving Communities
              </h2>
              <p className="text-gray-600 text-lg">
                Connect, collaborate, and learn with peers.
              </p>
            </div>
            <Link
              to="/communities" 
              className="mt-3 sm:mt-0 text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 group transition-colors"
              aria-label="View all communities"
            >
              Explore All Communities
              <ArrowRightIcon className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
           {communities.length === 0 && !error ? (
             <div className="text-center py-10 bg-gray-50 rounded-lg">
                <BriefcaseIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" /> 
                <p className="text-gray-600 text-lg">No active communities at the moment.</p>
                <p className="text-gray-500 mt-1">Why not start one?</p>
            </div>
           ) : communities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
              {communities.slice(0,3).map((community) => ( 
                <CommunityCard
                  key={community.id}
                  name={community.name}
                  members={community.members}
                  image={community.image || `https://source.unsplash.com/random/400x220/?community,group,${community.id}`}
                  topic={community.topic}
                  communityId={community.id}
                  onClick={() => navigate(`/communities/${community.id}`)}
                />
              ))}
            </div>
           ) : null }
        </section>

        <section>
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-8 md:p-12 shadow-xl text-white">
            <div className="md:flex items-center justify-between gap-8">
              <div className="md:w-3/5 mb-6 md:mb-0">
                <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-3">
                  FEATURED LEARNING PATH
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                  Master Full-Stack Web Development
                </h2>
                <p className="text-amber-50 mb-6 text-lg">
                  Go from novice to job-ready with our comprehensive path. Includes HTML, CSS, JavaScript, React, Node.js, databases, and more, with 50+ hands-on projects.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <button
                    onClick={() => navigate("/paths/web-development")} // Adjust path as needed
                    className="bg-white hover:bg-gray-100 text-orange-600 px-8 py-3.5 rounded-lg font-semibold shadow-md transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-200"
                  >
                    Explore Path
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-start">
                        <span className="text-gray-200 line-through text-sm">
                        $249.99
                        </span>
                        <span className="text-white font-bold text-2xl">$129.99</span>
                    </div>
                    <span className="bg-yellow-300 text-yellow-800 text-xs font-bold px-2 py-1 rounded">SAVE 48%</span>
                  </div>
                </div>
              </div>
              <div className="md:w-2/5 flex justify-center items-center">
                <img
                  src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29kaW5nfGVufDB8fDB8fHww&auto=format&fit=crop&w=400&q=60"
                  alt="Web Development Learning Path"
                  className="rounded-lg shadow-2xl max-h-80 object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="text-center">
          <div className="bg-blue-600 text-white rounded-2xl p-8 md:p-16 shadow-xl bg-cover bg-center" style={{backgroundImage: "url('https://source.unsplash.com/random/1200x400/?abstract,technology,learning')"}}>
            <div className="bg-blue-700 bg-opacity-70 p-8 rounded-xl backdrop-blur-sm">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Ready to Ignite Your Skill Journey?
                </h2>
                <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
                Join SkillHive today. Learn, connect, and grow with a global community of passionate learners and expert instructors.
                </p>
                <div className="flex justify-center gap-4 flex-wrap">
                <button
                    onClick={() => navigate("/signup")}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-300"
                >
                    Sign Up Free
                </button>
                <button
                    onClick={() => navigate("/courses")}
                    className="bg-transparent hover:bg-white/10 text-white px-8 py-3.5 rounded-lg font-semibold border-2 border-white shadow-lg transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/50"
                >
                    Browse All Courses
                </button>
                </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;