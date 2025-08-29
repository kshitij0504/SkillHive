import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import cloudinary from "../utils/cludinary.js";
import prisma from "../utils/prismaClient.js";
import { razorpayInstance } from "../utils/razorpay.js";
import crypto from "crypto"

const uploadToCloudinary = async (fileBuffer, folder, resource_type) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type,
        },
        (error, result) => {
          if (error)
            reject(new ApiError(500, "Failed to upload to Cloudinary"));
          else resolve(result.secure_url);
        }
      )
      .end(fileBuffer);
  });
};

const createCourse = async (req, res) => {
  try {
    if (!req.body) {
      throw new ApiError(400, "Request body is missing");
    }

    // Added price to destructuring
    const { title, description, tags, isMicroCourse, categoryId, price } = req.body;
    const image = req.files?.image?.[0];
    const video = req.files?.video?.[0];

    if (!title || !description) {
      throw new ApiError(400, "Title and description are required");
    }
    // Validate price
    const coursePrice = parseFloat(price);
    if (isNaN(coursePrice) || coursePrice < 0) {
        throw new ApiError(400, "Valid course price is required");
    }


    const isMicro = isMicroCourse === "true" || (video && !isMicroCourse);

    if (isMicro && !video) {
      throw new ApiError(400, "A video is required for a micro-course");
    }

    if (!isMicro && video) {
      throw new ApiError(
        400,
        "Videos for regular courses should be added via lessons"
      );
    }

    let parsedTags = [];
    try {
      if (typeof tags === "string") {
        parsedTags = JSON.parse(tags);
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }
      if (!Array.isArray(parsedTags)) {
        throw new Error();
      }
    } catch (error) {
      throw new ApiError(400, "Tags must be a valid JSON array or array");
    }

    const instructorId = parseInt(req.user.id);
    if (isNaN(instructorId)) {
      throw new ApiError(400, "Invalid instructor ID");
    }

    let imageUrl = null;
    let videoUrl = null;

    if (image) {
      imageUrl = await uploadToCloudinary(
        image.buffer,
        "courses/images",
        "image"
      );
    }

    if (isMicro && video) {
      videoUrl = await uploadToCloudinary(
        video.buffer,
        "courses/videos",
        "video"
      );
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        tags: parsedTags,
        imageUrl,
        videoUrl,
        isMicroCourse: isMicro,
        instructorId,
        categoryId: parseInt(categoryId),
        price: coursePrice, // Save the price
      },
      include: {
        sections: true,
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, course, "Course created successfully"));
  } catch (error) {
    console.error("Create Course Error:", error.message, error.stack);
    return res
      .status(error.statusCode || 500)
      .json(
        error instanceof ApiError
          ? error
          : new ApiError(500, "Failed to create course")
      );
  }
};

const addSection = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title } = req.body;

    if (!courseId || isNaN(parseInt(courseId))) {
      throw new ApiError(400, "Invalid course ID");
    }

    if (!title) {
      throw new ApiError(400, "Section title is required");
    }

    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
    });

    if (!course) {
      throw new ApiError(404, "Course not found");
    }

    if (course.isMicroCourse) {
      throw new ApiError(400, "Cannot add sections to a micro-course");
    }

    if (course.instructorId !== parseInt(req.user.id)) {
      throw new ApiError(403, "You are not the owner of this course");
    }

    const sectionCount = await prisma.section.count({
      where: { courseId: parseInt(courseId) },
    });

    const section = await prisma.section.create({
      data: {
        title,
        courseId: parseInt(courseId),
        order: sectionCount + 1,
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, section, "Section added successfully"));
  } catch (error) {
    console.error("Add Section Error:", error.message);
    return res
      .status(error.statusCode || 500)
      .json(
        error instanceof ApiError
          ? error
          : new ApiError(500, "Failed to add section")
      );
  }
};

const addLesson = async (req, res) => {
  try {
    const { title, description, isPreview } = req.body;
    const { sectionId } = req.params;
    const video = req.files?.video?.[0];

    if (!sectionId || isNaN(parseInt(sectionId))) {
      throw new ApiError(400, "Invalid section ID");
    }

    if (!title || !video) {
      throw new ApiError(400, "Title and video are required");
    }

    const section = await prisma.section.findUnique({
      where: { id: parseInt(sectionId) },
      include: { course: true },
    });

    if (!section) {
      throw new ApiError(404, "Section not found");
    }

    if (section.course.isMicroCourse) {
      throw new ApiError(400, "Cannot add lessons to a micro-course");
    }

    if (section.course.instructorId !== parseInt(req.user.id)) {
      throw new ApiError(403, "You are not the owner of this course");
    }

    const videoUrl = await uploadToCloudinary(
      video.buffer,
      "lessons/videos",
      "video"
    );

    const lessonCount = await prisma.lesson.count({
      where: { sectionId: parseInt(sectionId) },
    });

    const lesson = await prisma.lesson.create({
      data: {
        title,
        description: description || null,
        videoUrl,
        isPreview: isPreview === "true",
        sectionId: parseInt(sectionId),
        order: lessonCount + 1,
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, lesson, "Lesson added successfully"));
  } catch (error) {
    console.error("Add Lesson Error:", error.message);
    return res
      .status(error.statusCode || 500)
      .json(
        error instanceof ApiError
          ? error
          : new ApiError(500, "Failed to add lesson")
      );
  }
};

const reorderSections = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { order } = req.body;

    if (!courseId || isNaN(parseInt(courseId))) {
      throw new ApiError(400, "Invalid course ID");
    }

    if (!Array.isArray(order) || order.length === 0) {
      throw new ApiError(
        400,
        "Order must be a non-empty array of { sectionId, order }"
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
      include: { sections: true },
    });

    if (!course) {
      throw new ApiError(404, "Course not found");
    }

    if (course.isMicroCourse) {
      throw new ApiError(400, "Cannot reorder sections in a micro-course");
    }

    if (course.instructorId !== parseInt(req.user.id)) {
      throw new ApiError(403, "You are not the owner of this course");
    }

    const sectionIds = course.sections.map((section) => section.id);
    for (const item of order) {
      if (!sectionIds.includes(parseInt(item.sectionId))) {
        throw new ApiError(
          400,
          `Section ID ${item.sectionId} does not belong to this course`
        );
      }
      if (isNaN(parseInt(item.order))) {
        throw new ApiError(
          400,
          `Invalid order value for section ID ${item.sectionId}`
        );
      }
    }

    await prisma.$transaction(
      order.map((item) =>
        prisma.section.update({
          where: { id: parseInt(item.sectionId) },
          data: { order: parseInt(item.order) },
        })
      )
    );

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Sections reordered successfully"));
  } catch (error) {
    console.error("Reorder Sections Error:", error.message);
    return res
      .status(error.statusCode || 500)
      .json(
        error instanceof ApiError
          ? error
          : new ApiError(500, "Failed to reorder sections")
      );
  }
};

const reorderLessons = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { order } = req.body;

    if (!sectionId || isNaN(parseInt(sectionId))) {
      throw new ApiError(400, "Invalid section ID");
    }

    if (!Array.isArray(order) || order.length === 0) {
      throw new ApiError(
        400,
        "Order must be a non-empty array of { lessonId, order }"
      );
    }

    const section = await prisma.section.findUnique({
      where: { id: parseInt(sectionId) },
      include: { course: true, lessons: true },
    });

    if (!section) {
      throw new ApiError(404, "Section not found");
    }

    if (section.course.isMicroCourse) {
      throw new ApiError(400, "Cannot reorder lessons in a micro-course");
    }

    if (section.course.instructorId !== parseInt(req.user.id)) {
      throw new ApiError(403, "You are not the owner of this course");
    }

    const lessonIds = section.lessons.map((lesson) => lesson.id);
    for (const item of order) {
      if (!lessonIds.includes(parseInt(item.lessonId))) {
        throw new ApiError(
          400,
          `Lesson ID ${item.lessonId} does not belong to this section`
        );
      }
      if (isNaN(parseInt(item.order))) {
        throw new ApiError(
          400,
          `Invalid order value for lesson ID ${item.lessonId}`
        );
      }
    }

    await prisma.$transaction(
      order.map((item) =>
        prisma.lesson.update({
          where: { id: parseInt(item.lessonId) },
          data: { order: parseInt(item.order) },
        })
      )
    );

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Lessons reordered successfully"));
  } catch (error) {
    console.error("Reorder Lessons Error:", error.message);
    return res
      .status(error.statusCode || 500)
      .json(
        error instanceof ApiError
          ? error
          : new ApiError(500, "Failed to reorder lessons")
      );
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    // Added price to destructuring
    const { title, description, tags, price } = req.body;
    const image = req.files?.image?.[0];

    if (!id || isNaN(parseInt(id))) {
      throw new ApiError(400, "Invalid course ID");
    }

    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
    });

    if (!course) {
      throw new ApiError(404, "Course not found");
    }

    if (course.instructorId !== parseInt(req.user.id)) {
      throw new ApiError(403, "You are not the owner of this course");
    }

    let imageUrl = course.imageUrl;
    if (image) {
      imageUrl = await uploadToCloudinary(
        image.buffer,
        "courses/images",
        "image"
      );
    }

    let parsedTags = course.tags;
    if (tags) {
      try {
        if (typeof tags === "string") {
          parsedTags = JSON.parse(tags);
        } else if (Array.isArray(tags)) {
          parsedTags = tags;
        }
        if (!Array.isArray(parsedTags)) {
          throw new Error();
        }
      } catch (error) {
        throw new ApiError(400, "Tags must be a valid JSON array or array");
      }
    }

    let coursePrice = course.price;
    if (price !== undefined) {
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            throw new ApiError(400, "Invalid course price");
        }
        coursePrice = parsedPrice;
    }

    const updated = await prisma.course.update({
      where: { id: parseInt(id) },
      data: {
        title: title || course.title,
        description: description || course.description,
        imageUrl,
        tags: parsedTags,
        price: coursePrice, // Update price
        isApproved: false, // Reset approval on update
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, updated, "Course updated successfully"));
  } catch (error) {
    console.error("Update Course Error:", error.message, error.stack);
    return res
      .status(error.statusCode || 500)
      .json(
        error instanceof ApiError
          ? error
          : new ApiError(500, "Error in updating course")
      );
  }
};

const createRazorpayOrder = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = parseInt(req.user.id);

    if (!courseId || isNaN(parseInt(courseId))) {
      throw new ApiError(400, "Invalid course ID");
    }
    if (isNaN(userId)) {
        throw new ApiError(401, "User not authenticated");
    }

    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) },
    });

    if (!course) {
      throw new ApiError(404, "Course not found");
    }
    if (!course.price || course.price <= 0) {
        throw new ApiError(400, "Course price is not set or is invalid.");
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
            userId: userId,
            courseId: parseInt(courseId),
        }
    });
    if (existingEnrollment) {
        throw new ApiError(400, "You are already enrolled in this course.");
    }


    const amount = course.price * 100; // Amount in paisa
    const currency = "INR";
    const receipt = `receipt_course_${courseId}_user_${userId}_${Date.now()}`; // Unique receipt ID

    const options = {
      amount,
      currency,
      receipt,
      notes: {
        courseId: course.id.toString(),
        userId: userId.toString(),
        courseTitle: course.title,
      }
    };

    const order = await razorpayInstance.orders.create(options);

    if (!order) {
      throw new ApiError(500, "Failed to create Razorpay order");
    }

    // Optionally, save the order details in your database with 'created' status
    await prisma.order.create({
        data: {
            userId: userId,
            courseId: parseInt(courseId),
            razorpayOrderId: order.id,
            amount: course.price, // Store amount in rupees
            currency: order.currency,
            status: "created",
        }
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.RAZORPAY_KEY_ID, // Send key_id to frontend
          courseTitle: course.title,
          courseImage: course.imageUrl,
        },
        "Razorpay order created successfully"
      )
    );
  } catch (error) {
    console.error("Create Razorpay Order Error:", error.message, error.stack);
    return res
      .status(error.statusCode || 500)
      .json(
        error instanceof ApiError
          ? error
          : new ApiError(500, "Failed to create Razorpay order")
      );
  }
};

const verifyPaymentAndEnrollCourse = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;
    const userId = parseInt(req.user.id);

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId) {
      throw new ApiError(400, "Payment details are missing");
    }
    if (isNaN(userId)) {
        throw new ApiError(401, "User not authenticated");
    }
    const numericCourseId = parseInt(courseId);
     if (isNaN(numericCourseId)) {
      throw new ApiError(400, "Invalid Course ID format");
    }


    // 1. Verify the signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      // Update order status to 'failed'
      await prisma.order.updateMany({ // Use updateMany in case order wasn't found by razorpayOrderId initially
          where: { razorpayOrderId: razorpay_order_id, userId: userId },
          data: {
              status: "failed_signature_verification",
              razorpayPaymentId: razorpay_payment_id, // Log payment ID even if failed
              razorpaySignature: razorpay_signature,
          }
      });
      throw new ApiError(400, "Payment verification failed. Invalid signature.");
    }

    // 2. Find the order and course (important: check if order belongs to the user)
    const order = await prisma.order.findUnique({
        where: { razorpayOrderId: razorpay_order_id },
        include: { course: true }
    });

    if (!order) {
        throw new ApiError(404, "Order not found in our system.");
    }
    if (order.userId !== userId) {
        throw new ApiError(403, "This order does not belong to the current user.");
    }
    if (order.courseId !== numericCourseId) {
        throw new ApiError(400, "Order course ID mismatch with provided course ID.");
    }
    if (order.status === 'paid') {
        // Could be a retry, check if enrollment exists
        const existingEnrollment = await prisma.enrollment.findFirst({
            where: { userId: userId, courseId: numericCourseId, orderId: order.id }
        });
        if (existingEnrollment) {
             return res.status(200).json(
                new ApiResponse(200, { enrollment: existingEnrollment, order }, "Already enrolled and payment verified.")
            );
        }
        // If status is paid but no enrollment, something is wrong, but proceed to create one if possible
        console.warn(`Order ${order.id} was already paid but no enrollment found. Attempting to create enrollment.`);
    }


    // 3. Create Enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId: numericCourseId,
        progress: 0,
        orderId: order.id, // Link enrollment to the order
      },
    });

    // 4. Update Order Status in your DB
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
      },
    });

    // Optionally, remove from cart if it was added there
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
        await prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id,
                courseId: numericCourseId
            }
        });
    }


    return res.status(200).json(
      new ApiResponse(
        200,
        { enrollment, order: updatedOrder },
        "Payment verified and course enrolled successfully"
      )
    );
  } catch (error) {
    console.error("Verify Payment Error:", error.message, error.stack);
    const { razorpay_order_id, razorpay_payment_id } = req.body;
    if (razorpay_order_id) {
        await prisma.order.updateMany({
            where: { razorpayOrderId: razorpay_order_id, userId: parseInt(req.user.id) }, 
            data: {
                status: "failed",
                razorpayPaymentId: razorpay_payment_id || null, 
            }
        }).catch(dbError => console.error("Failed to update order status to 'failed' after error:", dbError));
    }
    return res
      .status(error.statusCode || 500)
      .json(
        error instanceof ApiError
          ? error
          : new ApiError(500, "Failed to verify payment and enroll course")
      );
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      throw new ApiError(400, "Invalid course ID");
    }

    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
    });

    if (!course) {
      throw new ApiError(404, "Course not found");
    }

    if (course.instructorId !== parseInt(req.user.id)) {
      throw new ApiError(403, "You are not the owner of this course");
    }

    await prisma.course.delete({ where: { id: parseInt(id) } });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Course deleted successfully"));
  } catch (error) {
    console.error("Delete Course Error:", error.message);
    return res
      .status(error.statusCode || 500)
      .json(
        error instanceof ApiError
          ? error
          : new ApiError(500, "Error in deleting course")
      );
  }
};

const approveCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      throw new ApiError(400, "Invalid course ID");
    }

    const course = await prisma.course.findUnique({
      where: { id: parseInt(id) },
    });

    if (!course) {
      throw new ApiError(404, "Course not found");
    }

    if (course.isApproved) {
      throw new ApiError(400, "Course is already approved");
    }

    const approved = await prisma.course.update({
      where: { id: parseInt(id) },
      data: { isApproved: true },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, approved, "Course approved successfully"));
  } catch (error) {
    console.error("Approve Course Error:", error.message);
    return res
      .status(error.statusCode || 500)
      .json(
        error instanceof ApiError
          ? error
          : new ApiError(500, "Error in approving course")
      );
  }
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: {
        isApproved: true, // Only fetch approved courses
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        price: true,
        categoryId: true,
        instructor: {
          select: {
            name: true,
          },
        },
        tags: true,
        _count: {
          select: {
            enrollments: true, // Count of enrolled students
          },
        },
      },
    });

    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      imageUrl: course.imageUrl || `https://source.unsplash.com/random/400x220/?learning,code,${course.id}`,
      price: course.price ? course.price.toString() : 'Free',
      instructor: course.instructor?.name || 'SkillHive Instructor',
      students: course._count.enrollments,
      tag: course.tags[0] || 'General', 
      rating: 4.5,
      categoryId: course.categoryId
    }));

    res.json({ data: formattedCourses });
  } catch (error) {
    console.error('Error fetching all courses:', error);
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
  }
};

const getInstructorCourses = async (req, res) => {
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
      },
      orderBy: { createdAt: "desc" },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { courses },
          "Instructor courses fetched successfully"
        )
      );
  } catch (error) {
    console.error("Instructor Courses Error:", error.message);
    return res
      .status(error.statusCode || 500)
      .json(
        error instanceof ApiError
          ? error
          : new ApiError(500, "Error in fetching instructor courses")
      );
  }
};

const getCurrentEnrollment = async (req, res) => {
  try {
    const userId = parseInt(req.user.id);

    if (isNaN(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: { userId },
      orderBy: { lastAccessedAt: "desc" },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            imageUrl:true
          },
        },
      },
    });

    if (!enrollment) {
      throw new ApiError(404, "No current enrollment found");
    }

    console.log(enrollment)
    const response = {
      courseId: enrollment.courseId,
      courseTitle: enrollment.course.title,
      progress: enrollment.progress,
      imageUrl: enrollment.course.imageUrl
    };

    console.log(response)

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          response,
          "Current enrollment fetched successfully"
        )
      );
  } catch (error) {
    console.error("Get Current Enrollment Error:", error.message);
    return res
      .status(error.statusCode || 500)
      .json(
        error instanceof ApiError
          ? error
          : new ApiError(500, "Failed to fetch current enrollment")
      );
  }
};

const getRecommendedCourses = async (req, res) => {
  try {
    const { tag } = req.query;

    const courses = await prisma.course.findMany({
      where: {
        isApproved: true,
        ...(tag ? { tags: { has: tag } } : {}),
      },
      include: {
        instructor: {
          select: { name: true },
        },
        reviews: {
          select: { rating: true },
        },
        enrollments: true,
      },
      take: 3, // Limit to 3 for recommendations
      orderBy: { createdAt: "desc" },
    });

    const formattedCourses = courses.map((course) => {
      const ratings = course.reviews.map((review) => review.rating);
      const averageRating = ratings.length
        ? (
            ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          ).toFixed(1)
        : 0;
      const students = course.enrollments.length;
      const tag = course.tags.includes("Bestseller")
        ? "Bestseller"
        : course.tags.includes("Hot & New")
        ? "Hot & New"
        : null;

      return {
        id: course.id,
        title: course.title,
        instructor: { name: course.instructor.name },
        imageUrl: course.imageUrl,
        rating: parseFloat(averageRating),
        students,
        price: course.price || 0,
        tag,
      };
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { courses: formattedCourses },
          "Recommended courses fetched successfully"
        )
      );
  } catch (error) {
    console.error("Get Recommended Courses Error:", error.message);
    return res
      .status(error.statusCode || 500)
      .json(
        error instanceof ApiError
          ? error
          : new ApiError(500, "Failed to fetch recommended courses")
      );
  }
};

const getCategory = async (req, res) => {
  try {
    const category = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, category, "Categories fetched successfully"));
  } catch (error) {
    console.error("Get Categories Error:", error.message);
    return res
      .status(500)
      .json(new ApiError(500, "Failed to fetch categories"));
  }
};

const courseDetails = async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const userId = parseInt(req.user.id);
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: { select: { id: true, name: true, profileUrl: true } },
        category: { select: { id: true, name: true, icon: true } },
        sections: {
          include: { lessons: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
        reviews: { select: { rating: true } },
        enrollments: { select: { userId: true } },
      },
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const averageRating = course.reviews.length
      ? course.reviews.reduce((sum, r) => sum + r.rating, 0) /
        course.reviews.length
      : null;
    const reviewsCount = course.reviews.length;
    const enrollmentsCount = course.enrollments.length;
    const isEnrolled = userId
      ? course.enrollments.some((e) => e.userId === userId)
      : false;

    res.json({
      success: true,
      data: {
        ...course,
        averageRating,
        reviewsCount,
        enrollmentsCount,
        isEnrolled,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        courseId: parseInt(courseId),
      },
    });

    res.json({ success: true, data: cartItem });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId: parseInt(courseId),
        progress: 0,
      },
    });

    res.json({ success: true, data: enrollment });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};


export {
  createCourse,
  addSection,
  addLesson,
  reorderSections,
  reorderLessons,
  updateCourse,
  deleteCourse,
  approveCourse,
  getAllCourses,
  getInstructorCourses,
  getCurrentEnrollment,
  getRecommendedCourses,
  getCategory,
  courseDetails,
  createRazorpayOrder,
  verifyPaymentAndEnrollCourse,
  enrollCourse,
  addToCart,
};
