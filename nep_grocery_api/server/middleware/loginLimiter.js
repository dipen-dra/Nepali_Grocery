import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, 
    max: 10, 
    message: {
        success: false,
        message: "Too many login attempts used. Please try again after 10 minutes."
    },
    standardHeaders: true, 
    legacyHeaders: false, 
});







