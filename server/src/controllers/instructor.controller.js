import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import prisma from "../utils/prismaClient.js";

const analytics = async (req, res) => {
  const instructorId = parseInt(req.user.id);
  try {
    const totalCourses = await prisma.course.count({
      where: {
        instructorId,
        isApproved: true,
      },
    });

    // Total enrollments
    const totalEnrollments = await prisma.enrollment.count({
      where: {
        course: { instructorId },
      },
    });

    // Total revenue
    const revenueData = await prisma.order.aggregate({
      where: {
        course: { instructorId },
        status: "paid",
      },
      _sum: {
        amount: true,
      },
    });
    const totalRevenue = revenueData._sum.amount || 0;

    const courses = await prisma.course.findMany({
      where: {
        instructorId,
        isApproved: true,
      },
      select: {
        id: true,
        title: true,
        enrollments: {
          select: {
            id: true,
            progress: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    const coursePerformance = courses.map((course) => {
      const averageRating =
        course.reviews.length > 0
          ? (
              course.reviews.reduce((sum, r) => sum + r.rating, 0) /
              course.reviews.length
            ).toFixed(1)
          : "N/A";
      const completionRate =
        course.enrollments.length > 0
          ? (
              (course.enrollments.filter((e) => e.progress >= 100).length /
                course.enrollments.length) *
              100
            ).toFixed(1)
          : 0;

      return {
        id: course.id,
        title: course.title,
        enrollments: course.enrollments.length,
        averageRating,
        completionRate,
      };
    });

    const analytics = {
      totalCourses,
      totalEnrollments,
      totalRevenue,
      coursePerformance,
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          analytics,
          "Instructor analytics fetched successfully"
        )
      );
  } catch (error) {
    console.error("Instructor Analytics Error:", error.message);
    throw new ApiError(500, "Failed to fetch instructor analytics");
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { instructorId: parseInt(req.user.id) },
      include: {
        sections: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                isPreview: true,
                order: true,
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      imageUrl: course.imageUrl,
      enrollments: course._count.enrollments,
      isApproved: course.isApproved,
      sections: course.sections,
    }));

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { courses: formattedCourses },
          "Instructor courses fetched successfully"
        )
      );
  } catch (error) {
    console.error("Instructor Courses Error:", error.message);
    throw new ApiError(500, "Failed to fetch instructor courses");
  }
};

const getInstructorCourseForEditController = async (req, res) => {
  const { courseId } = req.params;
  const instructorId = req.user.id; 

  if (!courseId) {
    res.status(400);
    throw new Error("Course ID is required.");
  }

  const course = await prisma.course.findUnique({
    where: {
      id: parseInt(courseId),
      instructorId: instructorId,
    },
    include: {
      category: true, // Include category details
      sections: {
        // Include sections
        orderBy: {
          // Assuming you have an 'order' field for sections or want to order by creation
          order: "asc", // or 'createdAt': 'asc'
        },
        include: {
          lessons: {
            // Include lessons for each section
            orderBy: {
              // Assuming you have an 'order' field for lessons
              order: "asc", // or 'createdAt': 'asc'
            },
          },
        },
      },
      // If 'whatYouWillLearn' is a JSON array field on the Course model,
      // it will be included by default.
      // If it's a separate related table, you'd include it like:
      // whatYouWillLearnItems: { select: { text: true } } // Example
    },
  });

  if (!course) {
    res.status(404);
    throw new Error(
      "Course not found or you do not have permission to view these details."
    );
  }

  // Ensure 'whatYouWillLearn' is always an array, even if null/undefined from DB
  // The frontend EditCoursePage.jsx expects an array.
  const whatYouWillLearn = Array.isArray(course.whatYouWillLearn)
    ? course.whatYouWillLearn
    : [];

  // Prepare the data structure expected by the frontend
  const courseDataForEdit = {
    ...course,
    whatYouWillLearn, // Use the processed array
    sections: course.sections.map((section) => ({
      ...section,
      lessons: section.lessons || [], // Ensure lessons is an array
    })),
  };

  res.status(200).json({
    success: true,
    message: "Course details fetched successfully for editing.",
    data: courseDataForEdit,
  });
};

export { analytics, getCourses, getInstructorCourseForEditController};
