import express from 'express';
import {
  createCourse,
  addSection,
  addLesson,
  reorderSections,
  reorderLessons,
  updateCourse,
  deleteCourse,
  getAllCourses,
  approveCourse,
  getInstructorCourses,
  getCurrentEnrollment,
  getRecommendedCourses,
  getCategory,
  courseDetails,
  addToCart,
  enrollCourse,
  createRazorpayOrder,
  verifyPaymentAndEnrollCourse,
} from '../controllers/course.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { analytics, getCourses, getInstructorCourseForEditController } from '../controllers/instructor.controller.js';

const router = express.Router();

// Learners (public or authenticated users)
router.get('/', getAllCourses);
router.get('/recommended', getRecommendedCourses);
router.get('/enrollments/current', isAuthenticated, getCurrentEnrollment);
router.get('/public/:courseId',isAuthenticated,courseDetails)
router.post('/cart/items',isAuthenticated,addToCart)
router.post('/enrollments',isAuthenticated,enrollCourse)
// Instructor routes
router.post('/create', isAuthenticated, authorizeRoles('INSTRUCTOR'), createCourse);
router.post('/:courseId/sections', isAuthenticated, authorizeRoles('INSTRUCTOR'), addSection);
router.post('/sections/:sectionId/lessons', isAuthenticated, authorizeRoles('INSTRUCTOR'), addLesson);
router.put('/:courseId/sections/reorder', isAuthenticated, authorizeRoles('INSTRUCTOR'), reorderSections);
router.put('/sections/:sectionId/lessons/reorder', isAuthenticated, authorizeRoles('INSTRUCTOR'), reorderLessons);
router.get('/my', isAuthenticated, authorizeRoles('INSTRUCTOR'), getInstructorCourses);
router.put('/:id', isAuthenticated, authorizeRoles('INSTRUCTOR'), updateCourse);
router.delete('/:id', isAuthenticated, authorizeRoles('INSTRUCTOR'), deleteCourse);
router.get("/category",isAuthenticated,getCategory)
router.post('/payment/create-order', isAuthenticated, createRazorpayOrder);
router.post('/payment/verify-enroll', isAuthenticated, verifyPaymentAndEnrollCourse);
router.get('/analytics',isAuthenticated, authorizeRoles('INSTRUCTOR'),analytics)
router.get(
  '/instructor/courses/:courseId',
  isAuthenticated,
  authorizeRoles('INSTRUCTOR'),
  getInstructorCourseForEditController
);
router.get('/courses',isAuthenticated, authorizeRoles('INSTRUCTOR'),getCourses)

// Admin routes
router.patch('/approve/:id', isAuthenticated, authorizeRoles('ADMIN'), approveCourse);

export default router;