import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  StarIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  BoltIcon,
  PencilSquareIcon, // For Edit Course button
  EyeIcon, // For View Course button (instructor)
} from '@heroicons/react/24/solid'; // Using solid icons for main buttons/indicators
import {
  TagIcon, // Outline icon for tag
} from '@heroicons/react/24/outline';


const CourseCard = ({
  courseId,
  title,
  instructor,
  image,
  rating, // Numeric rating
  students, // Total students/enrollments
  price, // Numeric price
  tag, // Category tag or "Bestseller", "Hot & New"
  user, // Current logged-in user object, needed for enrollment logic
  onEnrollmentSuccess, // Callback after successful enrollment
  initiallyEnrolled = false, // True if the user is already enrolled
  instructorView = false, // Flag to enable instructor-specific UI
  isApproved, // Specific for instructor view: course approval status
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(initiallyEnrolled);

  useEffect(() => {
    setIsEnrolled(initiallyEnrolled);
  }, [initiallyEnrolled]);

  const renderStars = (numRating) => {
    // Ensure rating is a number and within 0-5
    const safeRating = Math.max(0, Math.min(5, parseFloat(numRating) || 0));
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 >= 0.4; // Consider 0.4 and above as half star for visual representation
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <StarIcon key={`full-${i}`} className="h-4 w-4 text-amber-500" />
        ))}
        {hasHalfStar && (
          // You can use a dedicated HalfStarIcon if available or simulate
          <StarIcon className="h-4 w-4 text-amber-500 opacity-50" /> // A dimmed full star for simplicity
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
        ))}
      </div>
    );
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error('Failed to load Razorpay script.');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePaymentAndEnrollment = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login', { state: { from: `/courses/${courseId}` } });
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const orderResponse = await axios.post(
        `http://localhost:5000/course/payment/create-order`,
        { courseId },
        { withCredentials: true }
      );

      const { orderId, amount, currency, keyId, courseTitle: backendCourseTitle, courseImage: backendCourseImage } = orderResponse.data.data;

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load payment gateway. Please try again.');
        setIsLoading(false);
        return;
      }

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'SkillHive',
        description: `Payment for ${backendCourseTitle || title}`,
        image: backendCourseImage || image,
        order_id: orderId,
        handler: async function (response) {
          try {
            const verificationData = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              courseId: courseId,
            };
            const verificationResponse = await axios.post(
              `http://localhost:5000/course/payment/verify-enroll`,
              verificationData,
              { withCredentials: true }
            );

            if (verificationResponse.data.success) {
              alert('Payment successful! Enrolled in course.');
              setIsEnrolled(true);
              if (onEnrollmentSuccess) onEnrollmentSuccess(courseId);
            } else {
              setError(verificationResponse.data.message || 'Payment verification failed.');
            }
          } catch (verifyError) {
            console.error('Payment Verification Error:', verifyError);
            setError(verifyError.response?.data?.message || 'Payment verification failed. Please contact support.');
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        notes: {
          course_id: courseId.toString(),
          user_id: user.id.toString(),
        },
        theme: {
          color: '#2563EB', // Tailwind blue-600
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error('Razorpay Payment Failed:', response.error);
        setError(`Payment Failed: ${response.error.description} (Reason: ${response.error.reason})`);
        setIsLoading(false);
      });
      rzp.open();
    } catch (orderError) {
      console.error('Create Order Error:', orderError);
      setError(orderError.response?.data?.message || 'Could not initiate payment. Please try again.');
      setIsLoading(false);
    }
  };

  const handleFreeEnrollment = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login', { state: { from: `/courses/${courseId}` } });
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post(
        `http://localhost:5000/course/enroll-manual`,
        { courseId, userId: user.id },
        { withCredentials: true }
      );
      if (response.data.success) {
        alert('Successfully enrolled in this free course!');
        setIsEnrolled(true);
        if (onEnrollmentSuccess) onEnrollmentSuccess(courseId);
      } else {
        setError(response.data.message || 'Failed to enroll.');
      }
    } catch (err) {
      console.error('Free Enrollment Error:', err);
      setError(err.response?.data?.message || 'An error occurred during enrollment.');
    } finally {
      setIsLoading(false);
    }
  };

  const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]+/g,"")) : (price || 0);
  const isPaidCourse = numericPrice > 0;
  const displayPrice = isPaidCourse ? `₹${numericPrice.toFixed(2)}` : "Free";

  const numericRating = parseFloat(rating) || 0;
  const displayRating = numericRating.toFixed(1);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-blue-300 flex flex-col">
      {/* Course Image & Tag */}
      <Link
        to={instructorView ? `/instructor/course/${courseId}` : `/courses/${courseId}`}
        className="block relative h-48 sm:h-56"
        aria-label={`View course: ${title}`}
      >
        <img
          src={image || 'https://via.placeholder.com/400x300/e0f2f7/4a90e2?text=Course+Image'}
          alt={title}
          className="w-full h-full object-cover"
        />
        {tag && (
          <span className={`absolute top-3 left-3 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-md
            ${tag === 'Bestseller' ? 'bg-amber-500' :
              tag === 'Hot & New' ? 'bg-rose-500' :
              'bg-blue-500'}`}>
            <TagIcon className="h-3 w-3" /> {tag}
          </span>
        )}
      </Link>

      {/* Course Details */}
      <div className="p-5 flex flex-col flex-grow">
        <Link to={instructorView ? `/instructor/course/${courseId}` : `/courses/${courseId}`} className="block flex-grow">
          <h3 className="font-bold text-xl mb-2 text-gray-900 hover:text-blue-600 transition-colors line-clamp-2" title={title}>
            {title}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mb-3">By <span className="font-medium text-blue-700">{instructor || "Unknown Instructor"}</span></p>

        {!instructorView && ( // Only show rating and students for public/student view
          <div className="flex items-center mb-3">
            {numericRating > 0 ? (
              <>
                <span className="text-amber-500 font-bold mr-1">{displayRating}</span>
                {renderStars(numericRating)}
              </>
            ) : (
                <span className="text-gray-500 text-sm">No ratings yet</span>
            )}
            <span className="text-gray-500 text-sm ml-2">({students || 0} students)</span>
          </div>
        )}

        {error && <p className="text-red-500 text-xs my-2">{error}</p>}

        {/* Action Buttons (Conditional based on instructorView) */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          {instructorView ? (
            <>
              {/* Instructor View Actions */}
              <span className={`text-sm font-semibold flex items-center gap-1
                ${isApproved ? 'text-green-600' : 'text-amber-600'}`}>
                {isApproved ? <CheckCircleIcon className="h-5 w-5" /> : <TagIcon className="h-5 w-5" />}
                {isApproved ? 'Approved' : 'Pending Approval'}
              </span>
              <div className="flex gap-2">
                <Link
                  to={`/instructor/course/${courseId}/edit`}
                  className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors flex items-center gap-1"
                  aria-label="Edit course"
                >
                  <PencilSquareIcon className="h-4 w-4" /> Edit
                </Link>
                <Link
                  to={`/instructor/course/${courseId}`}
                  className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                  aria-label="View course details"
                >
                  <EyeIcon className="h-4 w-4" /> View
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Student/Public View Actions */}
              <span className={`font-bold text-xl ${isPaidCourse ? 'text-blue-600' : 'text-green-600'}`}>
                {displayPrice}
              </span>
              {isEnrolled ? (
                <button
                  onClick={(e) => {
                      e.preventDefault(); e.stopPropagation();
                      navigate(`/my-courses/${courseId}`); // Assuming path for enrolled courses
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  aria-label={`Go to course: ${title}`}
                >
                  <CheckCircleIcon className="h-5 w-5" /> Enrolled
                </button>
              ) : (
                <button
                  onClick={isPaidCourse ? handlePaymentAndEnrollment : handleFreeEnrollment}
                  disabled={isLoading}
                  className={`text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 transition-colors focus:outline-none focus:ring-2
                    ${isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : isPaidCourse
                        ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-2'
                        : 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500 focus:ring-offset-2'}`}
                  aria-label={isPaidCourse ? `Buy ${title}` : `Enroll in ${title} for free`}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : isPaidCourse ? <ShoppingCartIcon className="h-5 w-5" /> : <BoltIcon className="h-5 w-5" />}
                  {isLoading ? 'Processing...' : (isPaidCourse ? 'Buy Now' : 'Enroll Free')}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;