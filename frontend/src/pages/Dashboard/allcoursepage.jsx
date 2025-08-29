import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from './layout';
import CourseCard from '../../components/Coursers/CourseCard';
import axios from 'axios';
import { ArrowRightIcon, AcademicCapIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

const AllCoursesPage = () => {
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState([]);
  // categories will store objects like { id: '...', name: '...' }
  const [categories, setCategories] = useState([]);
  // activeCategory will store the ID of the selected category, or 'All' (string ID)
  const [activeCategory, setActiveCategory] = useState('All'); // 'All' is treated as a special ID

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // --- Fetch All Courses ---
        const coursesRes = await axios.get('http://localhost:5000/course', {
          withCredentials: true,
        });
        const fetchedCourses = coursesRes.data.data || [];
        console.log(fetchedCourses)
        setAllCourses(fetchedCourses);

        const categoryRes = await axios.get('http://localhost:5000/course/category', {
          withCredentials: true,
        });
        const fetchedCategoryObjects = categoryRes.data.data || [];
        console.log(fetchedCategoryObjects)

        const uniqueCategoriesWithAll = [
          { id: 'All', name: 'All' }, 
          ...Array.from(
            new Map(
              fetchedCategoryObjects
                .filter(cat => cat && (cat.id !== undefined && cat.id !== null) && cat.name) // Ensure id and name exist
                .map(cat => [cat.id, cat]) // Use category.id as key for Map to deduplicate
            ).values()
          )
        ];
        setCategories(uniqueCategoriesWithAll);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err.response?.data || err.message);
        setError('Failed to load data. Please try again later.');
        setAllCourses([]);
        // Set basic 'All' category if fetch fails to prevent UI breakdown
        setCategories([{ id: 'All', name: 'All' }]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Memoize filteredCourses to prevent unnecessary re-calculations
  const filteredCourses = useMemo(() => {
    if (activeCategory === 'All') {
      return allCourses;
    }

    return allCourses.filter(course => String(course.categoryId) === String(activeCategory));
  }, [allCourses, activeCategory]);

  // Helper to get the display name for the active category for the empty state message
  const getActiveCategoryName = useMemo(() => {
    const foundCategory = categories.find(cat => String(cat.id) === String(activeCategory));
    return foundCategory ? foundCategory.name : 'Selected Category'; // Fallback text
  }, [activeCategory, categories]);


  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading amazing courses...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto mt-10 px-4 sm:px-6 lg:px-8 py-16 text-center bg-white rounded-lg shadow-sm">
          <h2 className="text-3xl font-bold text-red-600 mb-4">Oops! Something went wrong.</h2>
          <p className="text-gray-700 text-lg mb-6">{error}</p>
          <p className="text-gray-500 text-md">Please try refreshing the page or check your internet connection.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Refresh Page
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* Header Section */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 sm:p-12 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-3 leading-tight">
                Discover Your Next Course
              </h1>
              <p className="text-gray-700 text-xl max-w-2xl">
                Dive into our comprehensive catalog of courses designed to empower your learning journey and career growth.
              </p>
            </div>
            <Link
              to="/categories"
              className="mt-6 sm:mt-0 px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-full font-semibold flex items-center gap-2 group hover:bg-blue-600 hover:text-white transition-all shadow-md"
              aria-label="View all categories"
            >
              Browse All Categories
              <ArrowRightIcon className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* Categories Filter Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <AdjustmentsHorizontalIcon className="h-7 w-7 text-blue-600" />
            Filter by Category
          </h2>
          <div className="flex flex-wrap gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((category) => ( // category is now an object { id, name }
              <button
                key={category.id} // Use category.id as the key for uniqueness and stability
                onClick={() => setActiveCategory(category.id)} // Set activeCategory to the ID
                className={`
                  px-6 py-2 rounded-full font-semibold text-lg whitespace-nowrap
                  transition-all duration-300 ease-in-out transform
                  ${String(activeCategory) === String(category.id) // Compare stringified IDs for robust matching
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                `}
              >
                {category.name} {/* Display category.name */}
              </button>
            ))}
          </div>
        </section>

        {/* Courses Grid */}
        <section>
          {filteredCourses.length === 0 && !loading ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-md flex flex-col items-center justify-center">
              <AcademicCapIcon className="h-20 w-20 text-blue-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                No courses found for "{getActiveCategoryName}" category.
              </h3>
              <p className="text-gray-600 text-lg max-w-md">
                Try selecting another category or check back later for new additions.
              </p>
              {activeCategory !== 'All' && (
                <button
                  onClick={() => setActiveCategory('All')}
                  className="mt-8 px-8 py-4 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-colors transform hover:scale-105"
                >
                  Show All Courses
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  title={course.title}
                  instructor={course.instructor}
                  image={course.imageUrl}
                  rating={course.rating}
                  students={course.students}
                  price={course.price}
                  tag={course.tag}
                  courseId={course.id}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default AllCoursesPage;