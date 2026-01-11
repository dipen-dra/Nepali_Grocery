import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;


    let token = null;

    // Check for token in cookies (preferred for browser) or Authorization header (fallback for API clients)
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Authentication failed: No token provided." });
    }

    try {
        if (!process.env.SECRET) {
            throw new Error('JWT Secret is not defined. Cannot verify token.');
        }

        const decoded = jwt.verify(token, process.env.SECRET);
        const user = await User.findById(decoded._id).select("-password");

        if (!user) {
            return res.status(401).json({ success: false, message: "Authentication failed: User not found." });
        }

        // Security Check: Account Deactivation
        if (!user.isActive) {
            return res.status(403).json({ success: false, message: "Your account has been deactivated. Please contact support." });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Authentication Error:", err.message);
        return res.status(401).json({ success: false, message: `Authentication failed: ${err.message}. Please try logging in again.` });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ success: false, message: "Access denied: Admin privileges are required." });
    }
};