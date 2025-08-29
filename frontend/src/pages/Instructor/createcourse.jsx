import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  BookOpenIcon,    // For Title/Description
  TagIcon,           // For Category
  SignalIcon,        // For Level
  CurrencyDollarIcon,// For Price
  PhotoIcon,      // For Thumbnail
  CloudArrowUpIcon,  // For Upload action
  CheckCircleIcon,   // For Success
  ExclamationCircleIcon, // For Errors
  PlusCircleIcon,     // For Create
} from "@heroicons/react/24/outline";
import Layout from "../Dashboard/layout"; // Assuming your Layout component

// Placeholder for categories and levels - in a real app, fetch these or manage them globally
const courseCategories = [
  { id: "tech", name: "Technology" },
  { id: "business", name: "Business" },
  { id: "design", name: "Design" },
  { id: "lifestyle", name: "Lifestyle" },
  { id: "arts", name: "Arts & Humanities" },
  { id: "health", name: "Health & Fitness" },
];

const courseLevels = [
  { id: "beginner", name: "Beginner" },
  { id: "intermediate", name: "Intermediate" },
  { id: "advanced", name: "Advanced" },
  { id: "all", name: "All Levels" },
];

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "",
    price: "", // Will be treated as number
    thumbnail: null, // File object
    // Add other fields like learningObjectives (string array), requirements (string array) if needed
  });
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null); // To associate course with instructor

  // Fetch current user to ensure they are an instructor
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/auth/current", {
          withCredentials: true,
        });
        if (data.data.role !== "INSTRUCTOR") {
          toast.error("Access restricted.");
          navigate("/dashboard");
        } else {
          setUser(data.data);
        }
      } catch (error) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, thumbnail: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, thumbnail: null }));
      setThumbnailPreview(null);
    }
  };

  const handleSubmit = async (e, status = "DRAFT") => { // status can be DRAFT or PENDING_APPROVAL
    e.preventDefault();
    if (!user) {
        toast.error("User not authenticated.");
        return;
    }

    // Basic Validation (add more as needed)
    if (!formData.title || !formData.description || !formData.category || !formData.level) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (status !== "DRAFT" && (!formData.price || parseFloat(formData.price) < 0)) {
        toast.error("Please enter a valid price for publishing.");
        return;
    }
     if (status !== "DRAFT" && !formData.thumbnail) {
        toast.error("Please upload a course thumbnail for publishing.");
        return;
    }


    setIsSubmitting(true);
    const submissionToast = toast.loading(status === "DRAFT" ? "Saving draft..." : "Submitting course...");

    const dataToSubmit = new FormData(); // Use FormData for file uploads
    dataToSubmit.append("title", formData.title);
    dataToSubmit.append("description", formData.description);
    dataToSubmit.append("category", formData.category);
    dataToSubmit.append("level", formData.level);
    dataToSubmit.append("price", parseFloat(formData.price) || 0); // Default to 0 if empty or invalid for draft
    dataToSubmit.append("status", status); // DRAFT, PENDING_APPROVAL
    dataToSubmit.append("instructorId", user.id); // Assuming user object has id

    if (formData.thumbnail) {
      dataToSubmit.append("thumbnail", formData.thumbnail); // 'thumbnail' should match backend multer field name
    }

    try {
      // Replace with your actual API endpoint
      const response = await axios.post("http://localhost:5000/course/create", dataToSubmit, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.dismiss(submissionToast);
      toast.success(response.data.message || `Course ${status === "DRAFT" ? "draft saved" : "submitted"} successfully!`, { icon: <CheckCircleIcon className="h-6 w-6 text-green-500" /> });
      // Navigate to the course editing page (if available) or instructor dashboard
      navigate(`/instructor/edit-course/${response.data.data.courseId}`); // Or /instructor/dashboard
    } catch (error) {
      console.error("Course creation error:", error.response?.data || error.message);
      toast.dismiss(submissionToast);
      toast.error(error.response?.data?.message || `Failed to ${status === "DRAFT" ? "save draft" : "submit course"}. Please try again.`, { icon: <ExclamationCircleIcon className="h-6 w-6 text-red-500" /> });
    } finally {
      setIsSubmitting(false);
    }
  };


  const InputField = ({ id, name, label, type = "text", value, onChange, placeholder, icon: Icon, required = true, children, helpText }) => (
    <div className="mb-6">
      <label htmlFor={id} className="flex items-center text-sm font-medium text-slate-700 mb-1">
        {Icon && <Icon className="h-5 w-5 mr-2 text-slate-500" />}
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea id={id} name={name} value={value} onChange={onChange} placeholder={placeholder} rows="4" required={required}
          className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm p-3 transition-colors duration-150"
        />
      ) : type === "select" ? (
         <select id={id} name={name} value={value} onChange={onChange} required={required}
          className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm p-3 transition-colors duration-150 bg-white"
        >
          {children}
        </select>
      ) : (
        <input type={type} id={id} name={name} value={value} onChange={onChange} placeholder={placeholder} required={required}
          className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm p-3 transition-colors duration-150"
          {...(type === "number" ? { min: "0", step: "any" } : {})}
        />
      )}
      {helpText && <p className="mt-1 text-xs text-slate-500">{helpText}</p>}
    </div>
  );


  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)} // Go back to previous page
                className="p-2 rounded-full hover:bg-slate-200 transition-colors mr-3"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="h-6 w-6 text-slate-700" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Create New Course</h1>
                <p className="text-sm text-slate-600 mt-1">Fill in the details below to set up your course.</p>
              </div>
            </div>
             <button // For potential future "View My Courses" quick link
                onClick={() => navigate("/instructor/dashboard")} // Or specific my-courses page
                className="text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
              >
                Back to Dashboard
              </button>
          </div>

          {/* Form Sections */}
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Section 1: Basic Information */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200/80">
              <h2 className="text-xl font-semibold text-slate-700 mb-6 pb-4 border-b border-slate-200 flex items-center">
                <BookOpenIcon className="h-6 w-6 mr-3 text-sky-600" />
                Course Fundamentals
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <InputField id="title" name="title" label="Course Title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Introduction to Web Development" />
                <InputField id="category" name="category" label="Category" type="select" value={formData.category} onChange={handleInputChange} icon={TagIcon}>
                  <option value="" disabled>Select a category</option>
                  {courseCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </InputField>
              </div>
              <InputField id="description" name="description" label="Course Description" type="textarea" value={formData.description} onChange={handleInputChange} placeholder="Provide a detailed description of your course..." helpText="Minimum 200 characters recommended for good visibility."/>
              <InputField id="level" name="level" label="Difficulty Level" type="select" value={formData.level} onChange={handleInputChange} icon={SignalIcon}>
                <option value="" disabled>Select a level</option>
                {courseLevels.map(lvl => <option key={lvl.id} value={lvl.id}>{lvl.name}</option>)}
              </InputField>
            </div>

            {/* Section 2: Pricing & Media */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200/80">
              <h2 className="text-xl font-semibold text-slate-700 mb-6 pb-4 border-b border-slate-200 flex items-center">
                <CurrencyDollarIcon className="h-6 w-6 mr-3 text-emerald-600" />
                Pricing & Media
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 items-start">
                <InputField id="price" name="price" label="Course Price (₹)" type="number" value={formData.price} onChange={handleInputChange} placeholder="e.g., 499 or 0 for free" required={false} helpText="Enter 0 for a free course. Required if publishing." />
                <div>
                  <label htmlFor="thumbnail" className="flex items-center text-sm font-medium text-slate-700 mb-1">
                    <PhotoIcon className="h-5 w-5 mr-2 text-slate-500" />
                    Course Thumbnail <span className="text-slate-500 ml-1 text-xs">(Required for publishing)</span>
                  </label>
                  <div className="mt-1 flex items-center justify-center w-full p-4 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer hover:border-sky-500 transition-colors duration-150 bg-slate-50">
                    <input id="thumbnail" name="thumbnail" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
                    <label htmlFor="thumbnail" className="w-full text-center cursor-pointer">
                      {thumbnailPreview ? (
                        <img src={thumbnailPreview} alt="Thumbnail preview" className="mx-auto max-h-48 rounded-md shadow-sm object-contain" />
                      ) : (
                        <div className="text-slate-500">
                          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-slate-400" />
                          <p className="mt-1 text-sm">Click to upload or drag and drop</p>
                          <p className="text-xs">PNG, JPG, WEBP up to 2MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                  {formData.thumbnail && <p className="mt-2 text-xs text-slate-600">Selected file: {formData.thumbnail.name}</p>}
                </div>
              </div>
            </div>

            {/* Section 3: Course Content Placeholder */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200/80">
              <h2 className="text-xl font-semibold text-slate-700 mb-2">Course Content Structure</h2>
              <p className="text-sm text-slate-600">
                Once you save this initial course setup, you'll be redirected to the course editor where you can add sections, lectures, quizzes, and assignments.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-slate-200">
              <button
                type="button" // Important: type="button" to not submit form by default
                onClick={() => navigate("/instructor/dashboard")}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors duration-150 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit" // Default submit action
                onClick={(e) => handleSubmit(e, "DRAFT")}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 border border-sky-600 text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                onClick={(e) => handleSubmit(e, "PENDING_APPROVAL")}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all duration-150 disabled:opacity-50 disabled:bg-sky-400"
              >
                <PlusCircleIcon className="h-5 w-5" />
                Create & Submit Course
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateCoursePage;