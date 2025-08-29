import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import moment from "moment-timezone";
dotenv.config();

const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory (for Cloudinary upload)
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit file size to 10MB
  },
});

const app = express();
app.use(
  cors({
    origin: [process.env.CLIENT_URL, "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS", "UPDATE", "PUT"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]));

morgan.token("date", () => {
  return moment().tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm:ss A");
});

app.use(
  morgan("[:date] :method :url :status :res[content-length] - :response-time ms")
);

import authRoutes from "./routes/auth.routes.js"
import courseRoutes from "./routes/course.route.js"
import multer from "multer";

app.use("/auth", authRoutes);
app.use("/course",courseRoutes)


export default app;