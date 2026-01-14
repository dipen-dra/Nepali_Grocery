

// Load environment variables
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import fs from "fs";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import adminUserRoutes from "./routes/admin/adminUserRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./Routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "https://localhost:5173",
      process.env.CLIENT_URL
    ];

    // Allow any 192.168.x.x origin (Local Network)
    // RegExp to match http://192.168.X.X:5173
    const localNetworkRegex = /^https:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/;

    if (allowedOrigins.includes(origin) || localNetworkRegex.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset", "Retry-After"],
};

// Rate Limiting Configuration
// We allow 1000 requests per 15-minute window per IP address.
// This is set higher for development purposes; consider lowering for production.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

import helmet from "helmet";

// Apply CORS globally before rate limiting
app.use(cors(corsOptions));

// Apply Helmet for security headers (Hides stack info, prevents clickjacking, etc.)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

import { cleanInput } from "./middleware/cleanInput.js";

// Apply rate limiting to all requests
app.use(limiter);

import { requestLogger } from "./middleware/requestLogger.js";

// Apply XSS Sanitization
app.use(cleanInput);

// Apply Winston Logger (Tracks all requests)
app.use(requestLogger);

connectDB();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);





import { activityLogger } from "./middleware/activityLogger.js";

// app.use(cors(corsOptions)); // Moved up
app.use(express.json());
app.use(cookieParser());
app.use(activityLogger); // Log all activities
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

let server;
try {
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'server.cert')),
  };

  server = https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`🔐 Secure Server running at https://localhost:${PORT}`);
    console.log(`🔐 Network Access: https://192.168.1.110:${PORT}`);
  });
} catch (error) {
  console.error("⚠️  HTTPS Error: SSL Certificates (server.key, server.cert) not found or invalid.");
  console.error("⚠️  Falling back to HTTP for development. Please generate certificates to enable End-to-End Encryption.");

  server = app.listen(PORT, () => {
    console.log(`⚠️  Insecure Server running at http://localhost:${PORT} and http://192.168.1.110:${PORT}`);
  });
}


export { app, server };
