import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "../Dashboard/layout"; // Ensure correct path
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
  AcademicCapIcon,
  BookOpenIcon,
  CheckCircleIcon,
  TrashIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  ArrowUturnLeftIcon,
  ArrowPathIcon,
  EyeIcon,
  ListBulletIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";

const EditCoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [whatYouWillLearn, setWhatYouWillLearn] = useState([""]);
  const [sections, setSections] = useState([]);

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [currentEditingLesson, setCurrentEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    videoFile: null,
    videoPreview: "",
    duration: 0,
    isPreview: false,
  });

  const [expandedSections, setExpandedSections] = useState({});

  // Toggle section accordion
  const toggleSectionAccordion = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Fetch course and categories
  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(
          `http://localhost:5000/course/instructor/courses/${courseId}`,
          { withCredentials: true }
        );
        const courseData = res.data.data;
        if (!courseData) throw new Error("Course data not found.");

        setCourse(courseData);
        setTitle(courseData.title || "");
        setShortDescription(courseData.shortDescription || "");
        setDescription(courseData.description || "");
        setPrice(courseData.price || 0);
        setCategoryId(courseData.category?.id || "");
        setImagePreview(courseData.imageUrl || "");
        setWhatYouWillLearn(
          courseData.whatYouWillLearn && courseData.whatYouWillLearn.length > 0
            ? courseData.whatYouWillLearn
            : [""]
        );
        const fetchedSections =
          courseData.sections?.map((s) => ({
            ...s,
            lessons: s.lessons?.map((l) => ({ ...l })) || [],
          })) || [];
        setSections(fetchedSections);

        if (fetchedSections.length > 0) {
          setExpandedSections({ [fetchedSections[0].id]: true });
        }
      } catch (err) {
        console.error("Error fetching course details:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load course details for editing."
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/course/category", {
          withCredentials: true,
        });
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    if (courseId) {
      fetchCourseDetails();
      fetchCategories();
    } else {
      navigate("/instructor/dashboard");
    }
  }, [courseId, navigate]);

  // Handle file inputs
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLessonForm((prev) => ({
        ...prev,
        videoFile: file,
        videoPreview: URL.createObjectURL(file),
      }));
    }
  };

  // Handle "What You Will Learn"
  const handleWhatYouWillLearnChange = (index, value) => {
    const newItems = [...whatYouWillLearn];
    newItems[index] = value;
    setWhatYouWillLearn(newItems);
  };

  const addWhatYouWillLearnItem = () => {
    setWhatYouWillLearn([...whatYouWillLearn, ""]);
  };

  const removeWhatYouWillLearnItem = (index) => {
    if (whatYouWillLearn.length === 1 && index === 0) {
      setWhatYouWillLearn([""]);
      return;
    }
    const newItems = whatYouWillLearn.filter((_, i) => i !== index);
    setWhatYouWillLearn(newItems);
  };

  // Handle sections
  const handleAddSection = async () => {
    const sectionTitle = prompt("Enter new section title (e.g., Module 1: Introduction):");
    if (sectionTitle && sectionTitle.trim() !== "") {
      try {
        const tempId = `temp-${Date.now()}`;
        const optimisticNewSection = { id: tempId, title: sectionTitle.trim(), lessons: [] };
        setSections([...sections, optimisticNewSection]);
        setExpandedSections((prev) => ({ ...prev, [tempId]: true }));

        const res = await axios.post(
          `http://localhost:5000/course/${courseId}/sections`,
          { title: sectionTitle.trim() },
          { withCredentials: true }
        );
        const newSectionFromServer = { ...res.data.data, lessons: [] };

        setSections((prevSections) =>
          prevSections.map((s) => (s.id === tempId ? newSectionFromServer : s))
        );
        setExpandedSections((prev) => {
          const newExpanded = { ...prev };
          delete newExpanded[tempId];
          newExpanded[newSectionFromServer.id] = true;
          return newExpanded;
        });
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to add section.");
        setSections((prevSections) =>
          prevSections.filter((s) => s.title !== sectionTitle.trim())
        );
      }
    }
  };

  const handleSectionTitleChange = (sectionId, newTitle) => {
    setSections(
      sections.map((sec) =>
        sec.id === sectionId ? { ...sec, title: newTitle } : sec
      )
    );
  };

  const handleDeleteSection = async (sectionIdToDelete) => {
    if (window.confirm("Are you sure you want to delete this section and all its lessons?")) {
      setSections(sections.filter((sec) => sec.id !== sectionIdToDelete));
    }
  };

  // Handle lessons
  const openLessonModal = (sectionId, lesson = null) => {
    setCurrentEditingLesson({ sectionId, lessonData: lesson });
    if (lesson) {
      setLessonForm({
        id: lesson.id,
        title: lesson.title || "",
        description: lesson.description || "",
        videoFile: null,
        videoPreview: lesson.videoUrl || "",
        duration: lesson.duration || 0,
        isPreview: lesson.isPreview || false,
      });
    } else {
      setLessonForm({
        title: "",
        description: "",
        videoFile: null,
        videoPreview: "",
        duration: 0,
        isPreview: false,
      });
    }
    setIsLessonModalOpen(true);
  };

  const closeLessonModal = () => {
    setIsLessonModalOpen(false);
    setCurrentEditingLesson(null);
    setLessonForm({
      title: "",
      description: "",
      videoFile: null,
      videoPreview: "",
      duration: 0,
      isPreview: false,
    });
  };

  const handleLessonFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLessonForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "duration" ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSaveLesson = async () => {
    if (!currentEditingLesson || !currentEditingLesson.sectionId) {
      toast.error("Error: Section context lost for saving lesson.");
      return;
    }
    const { sectionId, lessonData } = currentEditingLesson;
    setSaving(true);

    try {
      if (lessonData && lessonData.id) {
        // Update existing lesson
        const updatedSections = sections.map((sec) => {
          if (sec.id === sectionId) {
            return {
              ...sec,
              lessons: sec.lessons.map((l) =>
                l.id === lessonData.id
                  ? { ...l, ...lessonForm, videoUrl: lessonForm.videoPreview }
                  : l
              ),
            };
          }
          return sec;
        });
        setSections(updatedSections);

        if (lessonForm.videoFile) {
          const formData = new FormData();
          formData.append("video", lessonForm.videoFile);
          const videoRes = await axios.post(
            `http://localhost:5000/course/sections/${sectionId}/lessons/${lessonData.id}/upload-video`,
            formData,
            { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
          );
          setSections((prevSections) =>
            prevSections.map((sec) =>
              sec.id === sectionId
                ? {
                    ...sec,
                    lessons: sec.lessons.map((l) =>
                      l.id === lessonData.id ? { ...l, videoUrl: videoRes.data.videoUrl } : l
                    ),
                  }
                : sec
            )
          );
        }
      } else {
        // Add new lesson
        const lessonPayload = {
          title: lessonForm.title,
          description: lessonForm.description,
          duration: lessonForm.duration,
          isPreview: lessonForm.isPreview,
        };
        const res = await axios.post(
          `http://localhost:5000/course/sections/${sectionId}/lessons`,
          lessonPayload,
          { withCredentials: true }
        );
        let newLesson = res.data.data;

        if (lessonForm.videoFile) {
          const formData = new FormData();
          formData.append("video", lessonForm.videoFile);
          const videoRes = await axios.post(
            `http://localhost:5000/course/sections/${sectionId}/lessons/${newLesson.id}/upload-video`,
            formData,
            { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
          );
          newLesson.videoUrl = videoRes.data.videoUrl;
        }

        setSections((prevSections) =>
          prevSections.map((sec) =>
            sec.id === sectionId ? { ...sec, lessons: [...(sec.lessons || []), newLesson] } : sec
          )
        );
      }
      closeLessonModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save lesson.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = (sectionIdToFind, lessonIdToDelete) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      setSections((prevSections) =>
        prevSections.map((sec) =>
          sec.id === sectionIdToFind
            ? { ...sec, lessons: sec.lessons.filter((l) => l.id !== lessonIdToDelete) }
            : sec
        )
      );
    }
  };

  // Handle course submission
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const courseDataToSubmit = {
      title,
      shortDescription,
      description,
      price: Number(price),
      categoryId: Number(categoryId) || null,
      whatYouWillLearn: whatYouWillLearn.filter((item) => item && item.trim() !== ""),
      sections: sections.map((sec) => ({
        id: sec.id.startsWith("temp-") ? undefined : sec.id,
        title: sec.title,
        lessons: sec.lessons.map((l) => ({
          id: l.id.startsWith("temp-") ? undefined : l.id,
          title: l.title,
          description: l.description,
          videoUrl: l.videoUrl,
          duration: Number(l.duration) || 0,
          isPreview: l.isPreview || false,
        })),
      })),
    };

    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        const imageRes = await axios.post(
          `http://localhost:5000/course/${courseId}/upload-image`,
          formData,
          { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
        );
        courseDataToSubmit.imageUrl = imageRes.data.imageUrl;
      }

      await axios.put(
        `http://localhost:5000/course/${courseId}`,
        courseDataToSubmit,
        { withCredentials: true }
      );
      toast.success("Course updated successfully!");

      const fetchResponse = await axios.get(
        `http://localhost:5000/course/instructor/courses/${courseId}`,
        { withCredentials: true }
      );
      const updatedCourseData = fetchResponse.data.data;
      setCourse(updatedCourseData);
      setTitle(updatedCourseData.title || "");
      setShortDescription(updatedCourseData.shortDescription || "");
      setDescription(updatedCourseData.description || "");
      setPrice(updatedCourseData.price || 0);
      setCategoryId(updatedCourseData.category?.id || "");
      setImagePreview(updatedCourseData.imageUrl || "");
      setWhatYouWillLearn(
        updatedCourseData.whatYouWillLearn && updatedCourseData.whatYouWillLearn.length > 0
          ? updatedCourseData.whatYouWillLearn
          : [""]
      );
      setSections(
        updatedCourseData.sections?.map((s) => ({
          ...s,
          lessons: s.lessons?.map((l) => ({ ...l })) || [],
        })) || []
      );
    } catch (err) {
      console.error("Error updating course:", err);
      setError(err.response?.data?.message || "Failed to update course.");
    } finally {
      setSaving(false);
    }
  };

  // Loading and error states
  if (loading && !course) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <ArrowPathIcon className="h-12 w-12 animate-spin text-amber-600" />
          <span className="ml-3 text-lg text-gray-600">Loading Course Editor...</span>
        </div>
      </Layout>
    );
  }

  if (error && !course) {
    return (
      <Layout>
        <div className="text-center py-16 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-auto shadow-xl border border-red-200">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-red-700 mb-3">Error Loading Course</h2>
            <p className="text-gray-600 mb-6 text-sm">{error}</p>
            <button
              onClick={() => navigate("/instructor/dashboard")}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!course && !loading) {
    return (
      <Layout>
        <div className="text-center py-10 text-gray-500 text-lg">Course data could not be loaded.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white shadow-sm sticky top-10 z-40 mt-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              Edit: <span className="text-amber-600">{course?.title || "Course"}</span>
            </h1>
            <div className="flex items-center space-x-3">
              <Link
                to={`/courses/${courseId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-amber-600 hover:text-amber-700 font-medium inline-flex items-center px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors"
              >
                <EyeIcon className="h-5 w-5 mr-1.5" />
                View Public Page
              </Link>
              <button
                onClick={() => navigate("/instructor/dashboard")}
                className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg font-medium inline-flex items-center transition-colors"
              >
                <ArrowUturnLeftIcon className="h-5 w-5 mr-1.5" />
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mb-8 rounded-lg shadow">
            <div className="flex">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400 mr-3" />
              <div>
                <p className="font-bold">Update Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleCourseSubmit} className="space-y-10">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Left Column: Course Info & Learning Outcomes */}
            <div className="lg:col-span-2 space-y-8">
              {/* Course Details Card */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-4">
                  Course Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                  <div className="md:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      required
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-white"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="price"
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                      required
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
                      Short Description
                    </label>
                    <input
                      type="text"
                      id="shortDescription"
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      maxLength="200"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows="6"
                      required
                      className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-2">
                      Course Image
                    </label>
                    <input
                      type="file"
                      id="imageFile"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Course preview"
                        className="mt-4 h-48 w-auto object-cover rounded-lg border shadow-sm"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Learning Outcomes Card */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-4">
                  Learning Outcomes
                </h2>
                <div className="space-y-4">
                  {whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleWhatYouWillLearnChange(index, e.target.value)}
                        placeholder={`Outcome ${index + 1}`}
                        className="flex-grow block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm sm:text-sm focus:ring-amber-500 focus:border-amber-500"
                      />
                      {whatYouWillLearn.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeWhatYouWillLearnItem(index)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addWhatYouWillLearnItem}
                  className="mt-6 text-sm text-amber-600 hover:text-amber-700 font-medium inline-flex items-center py-2 px-4 rounded-lg hover:bg-amber-50 transition-colors border border-amber-200"
                >
                  <PlusCircleIcon className="h-5 w-5 mr-2" /> Add Outcome
                </button>
              </div>
            </div>

            {/* Right Column: Curriculum */}
            <div className="lg:col-span-1 space-y-8 mt-8 lg:mt-0">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Course Curriculum</h2>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all text-sm inline-flex items-center"
                  >
                    <PlusCircleIcon className="h-5 w-5 mr-2" /> Add Section
                  </button>
                </div>

                {sections.length === 0 && (
                  <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <ListBulletIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="font-medium">No sections yet.</p>
                    <p className="text-sm mt-1">Start by adding your first section.</p>
                  </div>
                )}

                <div className="space-y-4">
                  {sections.map((section, sectionIndex) => (
                    <div
                      key={section.id || `new-section-${sectionIndex}`}
                      className="border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSectionAccordion(section.id)}
                        className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none"
                      >
                        <div className="flex items-center flex-grow">
                          <input
                            type="text"
                            value={section.title}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleSectionTitleChange(section.id, e.target.value)}
                            placeholder="Section Title"
                            className="text-lg font-semibold text-gray-900 bg-transparent focus:ring-0 focus:border-amber-300 border-transparent border-b-2 hover:border-gray-300 transition-colors py-1 flex-grow"
                          />
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-gray-500">
                            {section.lessons?.length || 0} lessons
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSection(section.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                          {expandedSections[section.id] ? (
                            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                      </button>

                      {expandedSections[section.id] && (
                        <div className="p-4 bg-white">
                          {section.lessons && section.lessons.length > 0 ? (
                            <ul className="space-y-3">
                              {section.lessons.map((lesson, lessonIndex) => (
                                <li
                                  key={lesson.id || `new-lesson-${lessonIndex}`}
                                  className="p-3 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow flex justify-between items-center group"
                                >
                                  <div className="flex items-center min-w-0">
                                    <PlayCircleIcon
                                      className={`h-6 w-6 mr-3 flex-shrink-0 ${
                                        lesson.isPreview ? "text-green-500" : "text-amber-600"
                                      }`}
                                    />
                                    <div className="truncate">
                                      <span
                                        className="font-medium text-sm text-gray-900 block truncate"
                                        title={lesson.title}
                                      >
                                        {lesson.title || "Untitled Lesson"}
                                      </span>
                                      <p className="text-xs text-gray-500">
                                        {lesson.duration || 0} min
                                        {lesson.isPreview && (
                                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                                            Preview
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={() => openLessonModal(section.id, lesson)}
                                      className="p-2 text-gray-400 hover:text-amber-600 rounded-full hover:bg-amber-50"
                                    >
                                      <PencilSquareIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteLesson(section.id, lesson.id)}
                                      className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                                    >
                                      <TrashIcon className="h-5 w-5" />
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-4">
                              No lessons in this section yet.
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={() => openLessonModal(section.id, null)}
                            className="mt-4 text-sm text-amber-600 hover:text-amber-700 font-medium inline-flex items-center py-2 px-4 rounded-lg hover:bg-amber-50 transition-colors border border-amber-200"
                          >
                            <PlusCircleIcon className="h-5 w-5 mr-2" /> Add Lesson
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Footer Action Bar */}
          <div className="pt-6 border-t border-gray-200 bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 -mb-8 px-4 sm:px-6 lg:px-8 py-4 sticky bottom-0 z-30">
            <div className="container mx-auto flex justify-end items-center space-x-4">
              <Link
                to={`/courses/${courseId}`}
                className="bg-white hover:bg-gray-100 text-gray-700 font-medium py-2.5 px-6 rounded-lg shadow-sm border border-gray-300 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || loading}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Course"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Lesson Modal */}
      {isLessonModalOpen && currentEditingLesson && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto p-8 shadow-2xl rounded-2xl bg-white w-full max-w-md">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {currentEditingLesson.lessonData?.id ? "Edit Lesson" : "Add New Lesson"}
              </h3>
              <button
                onClick={closeLessonModal}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveLesson();
              }}
              className="space-y-6"
            >
              <div>
                <label htmlFor="lessonTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  id="lessonTitle"
                  value={lessonForm.title}
                  onChange={handleLessonFormChange}
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="lessonDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  id="lessonDescription"
                  value={lessonForm.description}
                  onChange={handleLessonFormChange}
                  rows="4"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="lessonVideoFile" className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Video
                </label>
                <input
                  type="file"
                  id="lessonVideoFile"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                />
                {lessonForm.videoPreview && (
                  <video
                    src={lessonForm.videoPreview}
                    controls
                    className="mt-4 w-full h-40 rounded-lg border shadow-sm"
                  />
                )}
              </div>
              <div>
                <label htmlFor="lessonDuration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  id="lessonDuration"
                  value={lessonForm.duration}
                  onChange={handleLessonFormChange}
                  min="0"
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    name="isPreview"
                    id="lessonIsPreview"
                    checked={lessonForm.isPreview}
                    onChange={handleLessonFormChange}
                    className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="lessonIsPreview" className="font-medium text-gray-700">
                    Allow Preview
                  </label>
                  <p className="text-xs text-gray-500">
                    Non-enrolled users can view this lesson.
                  </p>
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeLessonModal}
                  className="bg-white hover:bg-gray-100 text-gray-700 font-medium py-2 px-5 rounded-lg shadow-sm border border-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md disabled:opacity-70 flex items-center"
                >
                  {saving ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> Processing...
                    </>
                  ) : currentEditingLesson.lessonData?.id ? (
                    "Save Changes"
                  ) : (
                    "Add Lesson"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default EditCoursePage;