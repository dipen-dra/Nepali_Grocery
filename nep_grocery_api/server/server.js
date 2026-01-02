

// Load environment variables
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import adminUserRoutes from "./routes/admin/adminUserRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://192.168.1.110:5173",
    process.env.CLIENT_URL
  ].filter(Boolean),
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Rate Limiting Configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply CORS globally before rate limiting
app.use(cors(corsOptions));

// Apply rate limiting to all requests
app.use(limiter);

connectDB();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);





// app.use(cors(corsOptions)); // Moved up
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/payment", paymentRoutes);


app.get("/", (req, res) => {
  res.status(200).send("Welcome to the nepgrocery-backend API!");
});


app.use(errorHandler);


const PORT = process.env.PORT || 8081;
const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT} and http://192.168.1.110:${PORT}`);
});


export { app, server };
