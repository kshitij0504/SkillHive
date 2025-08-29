import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "./layout";
import {
  PlayCircleIcon,
  DocumentTextIcon,
  LockClosedIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  StarIcon,
  UsersIcon,
  ClockIcon,
  VideoCameraIcon,
  InformationCircleIcon,
  // CurrencyDollarIcon, // Not directly used in this version, price is displayed directly
  ShoppingCartIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CheckCircleIcon, // For "What you'll learn" list
  TagIcon, // For category
  PresentationChartLineIcon, // Example for placeholder tabs
} from "@heroicons/react/24/solid";

const VideoPlayer = ({ videoUrl, title }) => {
  if (!videoUrl) {
    return (
      // Enhanced placeholder styling
      <div className="aspect-video w-full bg-gray-900 flex items-center justify-center text-white rounded-xl overflow-hidden shadow-lg border-2 border-amber-400">
        <div className="flex flex-col items-center p-8 text-center">
          <VideoCameraIcon className="h-24 w-24 text-amber-500 mb-5 opacity-80" />
          <span className="text-xl font-semibold text-gray-100">
            Select a lesson to begin your journey
          </span>
          <p className="text-amber-400 mt-2 text-base">
            Explore the course curriculum on the right.
          </p>
        </div>
      </div>
    );
  }
  return (
    // Keeping player consistent
    <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-amber-400">
      <video
        key={videoUrl}
        controls
        autoPlay
        className="w-full h-full"
        title={title}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

const CoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `http://localhost:5000/course/public/${courseId}`,
          {
            withCredentials: true,
          }
        );

        const fetchedCourse = res.data.data;
        if (!fetchedCourse) {
          throw new Error("Course not found.");
        }

        setCourseData(fetchedCourse);

        if (fetchedCourse.sections && fetchedCourse.sections.length > 0) {
          setExpandedSections({ [fetchedCourse.sections[0].id]: true });
          const firstPreviewableOrFirstLesson =
            fetchedCourse.sections
              .flatMap((s) => s.lessons)
              .find((l) => l.isPreview) ||
            (fetchedCourse.isEnrolled &&
              fetchedCourse.sections[0].lessons[0]) || // If enrolled, pick first lesson of first section
            null;

          if (firstPreviewableOrFirstLesson) {
            setCurrentLesson(firstPreviewableOrFirstLesson);
          }
        }
      } catch (err) {
        console.error("Error fetching course:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load course details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]); // Removed courseData.isEnrolled dependency from here to avoid potential loops on enroll

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleLessonClick = async (lesson) => {
    if (lesson.isPreview || courseData?.isEnrolled) {
      setCurrentLesson(lesson);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Consider a more integrated notification system (e.g., toast)
      alert("Please enroll in the course to view this lesson.");
    }
  };

  const handleAddToCart = async () => {
    try {
      await axios.post(
        `http://localhost:5000/course/cart/items`,
        { courseId: parseInt(courseId) },
        { withCredentials: true }
      );
      alert("Course added to cart!"); 
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert(err.response?.data?.message || "Failed to add course to cart.");
    }
  };

  const handleEnrollNow = async () => {
    try {
      await axios.post(
        `http://localhost:5000/course/enrollments`,
        { courseId: parseInt(courseId) },
        { withCredentials: true }
      );
      alert("Successfully enrolled in the course!"); 
      const res = await axios.get(
        `http://localhost:5000/course/public/${courseId}`,
        {
          withCredentials: true,
        }
      );
      setCourseData(res.data.data);
    } catch (err) {
      console.error("Error enrolling:", err);
      alert(err.response?.data?.message || "Failed to enroll in the course.");
    }
  };

  const courseMeta = useMemo(() => {
    if (!courseData?.sections)
      return { totalLessons: 0, totalDurationMinutes: 0 };
    let totalLessons = 0;
    let totalDurationMinutes = 0;
    courseData.sections.forEach((section) => {
      totalLessons += section.lessons.length;
      section.lessons.forEach((lesson) => {
        // API should ideally provide duration in a consistent unit (e.g., seconds or minutes)
        totalDurationMinutes += lesson.duration || 0;
      });
    });
    return { totalLessons, totalDurationMinutes };
  }, [courseData]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-20 px-4">
          <div className="bg-white rounded-xl p-8 sm:p-12 max-w-lg mx-auto shadow-2xl border border-red-200">
            <InformationCircleIcon className="h-20 w-20 text-red-500 mx-auto mb-5" />
            <h2 className="text-3xl font-bold text-red-700 mb-4">
              Oops! An Error Occurred.
            </h2>
            <p className="text-gray-600 mb-8 text-lg">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-lg font-semibold shadow-md transition-all hover:scale-105 focus:ring-4 focus:ring-blue-300"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!courseData) {
    return (
      <Layout>
        <div className="text-center py-10 text-gray-500 text-xl">
          Course data not found. Please try again later.
        </div>
      </Layout>
    );
  }

  const {
    title,
    description,
    imageUrl,
    instructor,
    sections,
    averageRating,
    reviewsCount,
    enrollmentsCount,
    price,
    category,
    isEnrolled,
  } = courseData;

  const whatYouWillLearnItems = courseData.whatYouWillLearn || [
    "Key concepts of the course explained clearly",
    "Practical applications and hands-on examples",
    "Advanced techniques for mastery",
    "Real-world problem-solving skills",
    "How to build X from scratch",
    "Understand Y framework in depth",
  ];

  return (
    <Layout>
     <div className="bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-900 text-white pt-12 pb-16 shadow-lg rounded-2xl max-w-dvw mx-auto mt-15 mr-30 ml-30 px-6 md:px-8 relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <nav aria-label="breadcrumb" className="mb-4 text-sm">
            <ol className="flex items-center space-x-2">
              <li>
                <Link
                  to="/courses"
                  className="hover:underline text-amber-300 hover:text-amber-200 transition-colors"
                >
                  Courses
                </Link>
              </li>
              <li>
                <span className="text-amber-200 opacity-70">/</span>
              </li>
              <li>
                <Link
                  to={`/categories/${category?.slug || category?.id}`}
                  className="hover:underline text-amber-300 hover:text-amber-200 transition-colors flex items-center"
                >
                  <TagIcon className="h-4 w-4 mr-1.5 opacity-80" />
                  {category?.name || "Category"}
                </Link>
              </li>
            </ol>
          </nav>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 tracking-tight text-shadow-sm">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-6 max-w-3xl leading-relaxed opacity-90">
            {courseData.shortDescription ||
              description?.substring(0, 150) +
                (description?.length > 150 ? "..." : "")}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-base mb-6">
            {averageRating > 0 && (
              <span className="flex items-center">
                <StarIcon className="h-5 w-5 text-amber-400 mr-1.5" />
                <span className="font-semibold">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-blue-200 ml-1.5">
                  ({reviewsCount} ratings)
                </span>
              </span>
            )}
            <span className="flex items-center">
              <UsersIcon className="h-5 w-5 text-blue-300 mr-1.5" />
              <span className="font-semibold">{enrollmentsCount}</span>
              <span className="text-blue-200 ml-1.5">students</span>
            </span>
            {courseMeta.totalDurationMinutes > 0 && (
              <span className="flex items-center">
                <ClockIcon className="h-5 w-5 text-blue-300 mr-1.5" />
                <span className="font-semibold">
                  {Math.floor(courseMeta.totalDurationMinutes / 60)}h{" "}
                  {courseMeta.totalDurationMinutes % 60}m
                </span>
                <span className="text-blue-200 ml-1.5">total</span>
              </span>
            )}
          </div>
          <div className="flex items-center text-md">
            <img
              src={
                instructor?.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  instructor?.name || "S H"
                )}&background=0D8ABC&color=fff&font-size=0.5`
              }
              alt={instructor?.name}
              className="h-10 w-10 rounded-full mr-3 border-2 border-blue-400"
            />
            <div>
              <span className="text-blue-200 text-sm">Created by</span>
              <Link
                to={`/instructors/${instructor?.id}`}
                className="font-semibold hover:underline text-amber-300 ml-1 block leading-tight"
              >
                {instructor?.name || "SkillHive Team"}
              </Link>
            </div>
          </div>
          <p className="text-sm text-blue-200 opacity-80 mt-4">
            Last updated:{" "}
            {new Date(courseData.updatedAt || Date.now()).toLocaleDateString(
              "en-US",
              { year: "numeric", month: "long", day: "numeric" }
            )}
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 lg:px-8 py-10 md:py-12">
        <div className="lg:flex lg:flex-row-reverse lg:gap-8">
          <div className="lg:w-1/3 mb-10 lg:mb-0">
            <div className="sticky top-6 space-y-8">
              <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                {imageUrl &&
                  !currentLesson?.videoUrl && ( 
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-full object-cover aspect-[16/10]"
                    />
                  )}
                {currentLesson?.videoUrl && ( 
                  <div className="aspect-video w-full bg-black rounded-t-xl overflow-hidden">
                    <video
                      key={`${currentLesson.id}-preview`}
                      className="w-full h-full"
                      title={currentLesson.title}
                      src={currentLesson.videoUrl}
                      poster={imageUrl}
                      muted
                      loop
                      playsInline
                    ></video>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-4xl font-extrabold text-blue-800">
                      {price === 0 ? "Free" : `$${price.toFixed(2)}`}
                    </h2>
                    {price > 0 && !isEnrolled && (
                      <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                        Offer
                      </span>
                    )}
                  </div>

                  {!isEnrolled ? (
                    <div className="space-y-3">
                      <button
                        onClick={handleEnrollNow}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-lg text-lg flex items-center justify-center gap-2 transition-all hover:shadow-lg transform hover:-translate-y-0.5 focus:ring-4 focus:ring-blue-300"
                      >
                        {price === 0 ? "Enroll for Free" : "Enroll Now"}
                      </button>

                      {price > 0 && (
                        <button
                          onClick={handleAddToCart}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 px-4 rounded-lg text-lg flex items-center justify-center gap-2 transition-all hover:shadow-lg transform hover:-translate-y-0.5 focus:ring-4 focus:ring-amber-300"
                        >
                          <ShoppingCartIcon className="h-5 w-5" /> Add to Cart
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-300 text-green-700 rounded-lg p-4 text-center font-semibold">
                      <CheckCircleIcon className="h-6 w-6 inline mr-2" /> You
                      are enrolled in this course
                    </div>
                  )}

                  {price > 0 && !isEnrolled && (
                    <p className="text-xs text-gray-500 text-center mt-3">
                      30-Day Money-Back Guarantee
                    </p>
                  )}

                  <hr className="my-5 border-gray-200" />

                  <h4 className="font-bold text-xl text-blue-800 mb-3">
                    This course includes:
                  </h4>
                  <ul className="space-y-2.5 text-gray-700">
                    <li className="flex items-center">
                      <ClockIcon className="h-5 w-5 mr-3 text-amber-600 flex-shrink-0" />
                      <span>
                        {Math.floor(courseMeta.totalDurationMinutes / 60)}h{" "}
                        {courseMeta.totalDurationMinutes % 60}m on-demand video
                      </span>
                    </li>
                    <li className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 mr-3 text-amber-600 flex-shrink-0" />
                      <span>{courseMeta.totalLessons} lessons & modules</span>
                    </li>
                    <li className="flex items-center">
                      <BookOpenIcon className="h-5 w-5 mr-3 text-amber-600 flex-shrink-0" />
                      <span>Downloadable resources & articles</span>
                    </li>
                    <li className="flex items-center">
                      <UsersIcon className="h-5 w-5 mr-3 text-amber-600 flex-shrink-0" />
                      <span>Full lifetime access</span>
                    </li>
                    <li className="flex items-center">
                      <AcademicCapIcon className="h-5 w-5 mr-3 text-amber-600 flex-shrink-0" />
                      <span>Certificate of completion</span>
                    </li>
                  </ul>

                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-5 text-sm">
                    <button className="text-blue-600 hover:text-blue-800 hover:underline px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-300">
                      Share
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 hover:underline px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-300">
                      Gift this course
                    </button>
                  </div>
                </div>
              </div>
              {/* Course Content Accordion - Placed after enrollment card on mobile, but sidebar on desktop due to flex-row-reverse */}
              <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-700 to-blue-800 text-white">
                  <h3 className="text-xl font-bold flex items-center">
                    <BookOpenIcon className="h-6 w-6 mr-2.5" />
                    Course Curriculum
                  </h3>
                  <span className="text-sm font-medium bg-amber-400 text-blue-900 px-2.5 py-1 rounded-full">
                    {courseMeta.totalLessons} lessons &bull;{" "}
                    {Math.floor(courseMeta.totalDurationMinutes / 60)}h{" "}
                    {courseMeta.totalDurationMinutes % 60}m
                  </span>
                </div>

                <div className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
                  {" "}
                  {/* Max height and scroll for long curriculums */}
                  {sections && sections.length > 0 ? (
                    sections.map((section, sectionIndex) => (
                      <div
                        key={section.id}
                        className="border-b border-gray-200 last:border-b-0"
                      >
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="w-full flex justify-between items-center p-4 text-left hover:bg-amber-50 transition-colors focus:outline-none"
                          aria-expanded={expandedSections[section.id]}
                          aria-controls={`section-content-${section.id}`}
                        >
                          <div className="flex items-center">
                            <span
                              className={`transform transition-transform duration-200 ease-in-out ${
                                expandedSections[section.id] ? "rotate-90" : ""
                              } mr-3`}
                            >
                              <ChevronDownIcon className="h-5 w-5 text-amber-600" />
                            </span>
                            <span className="font-semibold text-blue-700 text-md">
                              {section.title}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 font-medium">
                            {section.lessons.length} lessons &bull;{" "}
                            {/* Calculate section duration */}
                            {Math.floor(
                              section.lessons.reduce(
                                (sum, l) => sum + (l.duration || 0),
                                0
                              ) / 60
                            )}
                            h{" "}
                            {section.lessons.reduce(
                              (sum, l) => sum + (l.duration || 0),
                              0
                            ) % 60}
                            m
                          </span>
                        </button>
                        {expandedSections[section.id] && (
                          <ul
                            id={`section-content-${section.id}`}
                            className="divide-y divide-gray-100 bg-white border-t border-gray-200"
                          >
                            {section.lessons.map((lesson) => (
                              <li key={lesson.id}>
                                <button
                                  onClick={() => handleLessonClick(lesson)}
                                  className={`w-full p-3.5 text-left hover:bg-blue-50 flex items-center transition-colors group ${
                                    currentLesson?.id === lesson.id
                                      ? "bg-blue-100 text-blue-700 font-semibold"
                                      : "text-gray-700 hover:text-blue-600"
                                  }`}
                                  disabled={!lesson.isPreview && !isEnrolled}
                                >
                                  <div className="flex-shrink-0 mr-3">
                                    {lesson.isPreview || isEnrolled ? (
                                      <PlayCircleIcon
                                        className={`h-6 w-6 ${
                                          currentLesson?.id === lesson.id
                                            ? "text-blue-600"
                                            : "text-amber-500 group-hover:text-amber-600"
                                        }`}
                                      />
                                    ) : (
                                      <LockClosedIcon className="h-6 w-6 text-gray-400" />
                                    )}
                                  </div>
                                  <div className="flex-grow mr-2 text-sm">
                                    <div
                                      className={`${
                                        currentLesson?.id === lesson.id
                                          ? "font-semibold"
                                          : "font-medium"
                                      }`}
                                    >
                                      {lesson.title}
                                    </div>
                                  </div>
                                  <div className="flex flex-shrink-0 items-center space-x-2">
                                    {lesson.isPreview &&
                                      !isEnrolled && ( // Show preview tag only if not enrolled
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                          Preview
                                        </span>
                                      )}
                                    {lesson.duration > 0 && (
                                      <span className="text-xs text-gray-500 whitespace-nowrap">
                                        {lesson.duration < 60
                                          ? `${lesson.duration}s`
                                          : `${Math.floor(
                                              lesson.duration / 60
                                            )}m ${lesson.duration % 60}s`}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 p-6 text-center">
                      No curriculum content available for this course yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Main Content Area - Video Player and Tabs */}
          <div className="lg:w-2/3">
            {" "}
            {/* Takes up remaining width */}
            <VideoPlayer
              videoUrl={currentLesson?.videoUrl}
              title={currentLesson?.title}
            />
            {currentLesson && (
              <div className="mt-6 p-5 bg-white border border-gray-200 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-blue-800 mb-2">
                  {currentLesson.title}
                </h2>
                {currentLesson.description && (
                  <p className="text-gray-700 leading-relaxed">
                    {currentLesson.description}
                  </p>
                )}
              </div>
            )}
            <div className="mt-8 border-b border-gray-300">
              <nav
                className="-mb-px flex space-x-6 sm:space-x-8"
                aria-label="Tabs"
              >
                {["overview", "qna", "notes", "announcements"].map(
                  (tabName) => (
                    <button
                      key={tabName}
                      onClick={() => setActiveTab(tabName)}
                      className={`${
                        activeTab === tabName
                          ? "border-amber-500 text-blue-700 font-bold"
                          : "border-transparent text-gray-500 hover:text-blue-600 hover:border-gray-400"
                      } whitespace-nowrap pb-3 pt-1 px-1 border-b-2 font-medium text-base capitalize transition-all`}
                    >
                      {tabName.replace("qna", "Q&A")}
                    </button>
                  )
                )}
              </nav>
            </div>
            <div className="py-6 min-h-[300px]">
              {" "}
              {/* Min height for tab content area */}
              {activeTab === "overview" && (
                <div className="prose prose-lg max-w-none">
                  {" "}
                  {/* Increased prose size */}
                  <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-3xl font-bold mb-5 text-blue-800">
                      About This Course
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-8">
                      {description}
                    </p>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-2xl font-semibold mb-6 text-blue-700">
                        What You'll Learn
                      </h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-700">
                        {whatYouWillLearnItems.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircleIcon className="h-6 w-6 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              {["qna", "notes", "announcements"].includes(activeTab) && (
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
                  <div className="text-center py-10">
                    <PresentationChartLineIcon className="h-16 w-16 text-amber-500 mx-auto mb-4 opacity-70" />{" "}
                    {/* Example icon */}
                    <h3 className="text-2xl font-semibold text-blue-800 mb-2 capitalize">
                      {activeTab.replace("qna", "Q&A")}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      This section is coming soon! Engage with peers and
                      instructors once available.
                    </p>
                    {isEnrolled ? (
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all font-medium">
                        Notify Me When Available
                      </button>
                    ) : (
                      <p className="text-sm text-amber-700 font-medium">
                        Enroll in the course to access this feature when it
                        launches.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CoursePage;
