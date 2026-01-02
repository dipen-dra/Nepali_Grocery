import rateLimit from 'express-rate-limit';

// Limit OTP Verification attempts (Brute-force protection)
export const otpVerifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 OTP verification attempts per window
    message: {
        success: false,
        message: "Too many invalid OTP attempts. Please try again after 15 minutes."
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Limit OTP Requests/Generation (Spam/Email flooding protection)
export const otpRequestLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 OTP requests per hour
    message: {
        success: false,
        message: "You have requested OTPs too frequently. Please wait 1 hour before trying again."
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
