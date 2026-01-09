import logger from '../utils/logger.js';

/**
 * Middleware to log HTTP requests.
 * Captures Method, URL, Status, Response Time, IP, and User ID (if identifiable).
 */
export const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Hook into response 'finish' event to log after the response is sent
    res.on('finish', () => {
        const duration = Date.now() - start;
        const { method, originalUrl, ip } = req;
        const { statusCode } = res;

        // Extract user info if available (from Auth middleware)
        const user = req.user ? `User:${req.user._id}` : 'Guest';
        const userAgent = req.get('user-agent') || 'Unknown User-Agent';

        const message = `${method} ${originalUrl} ${statusCode} ${duration}ms - ${ip} - ${user}`;
        const meta = {
            ip,
            userAgent,
            user: req.user ? req.user.email : 'Unauthenticated',
            body: req.method === 'POST' ? sanitizeBody(req.body) : undefined // Log stripped body for debugging
        };

        if (statusCode >= 500) {
            logger.error(message, meta); // Critical Server Error
        } else if (statusCode >= 400) {
            logger.warn(message, meta); // Client Error / Suspicious (401, 403, 404, 429)
        } else {
            logger.info(message, meta); // Success (200, 201)
        }
    });

    next();
};

// Helper: Remove sensitive fields from logs
const sanitizeBody = (body) => {
    if (!body) return {};
    const sanitized = { ...body };
    const sensitiveKeys = ['password', 'token', 'creditCard', 'otp'];
    sensitiveKeys.forEach(key => {
        if (sanitized[key]) sanitized[key] = '***REDACTED***';
    });
    return sanitized;
};
