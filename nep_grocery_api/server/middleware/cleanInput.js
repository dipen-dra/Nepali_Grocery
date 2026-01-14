import xss from 'xss';

/**
 * Middleware to sanitize user input using the 'xss' library.
 * It iterates over req.body, req.query, and req.params to clean any malicious scripts.
 */
export const cleanInput = (req, res, next) => {
    try {
        if (req.body) {
            req.body = sanitizeObject(req.body);
        }
        if (req.query) {
            // Fix: Modify keys in-place instead of reassigning req.query
            const cleanedQuery = sanitizeObject(req.query);
            for (const key in cleanedQuery) {
                req.query[key] = cleanedQuery[key];
            }
        }
        if (req.params) {
            // Fix: Modify keys in-place instead of reassigning req.params
            const cleanedParams = sanitizeObject(req.params);
            for (const key in cleanedParams) {
                req.params[key] = cleanedParams[key];
            }
        }
        next();
    } catch (error) {
        console.error("XSS Sanitization Error:", error);
        next(error);
    }
};

/**
 * recursively sanitizes an object or string
 */
const sanitizeObject = (data) => {
    if (typeof data === 'string') {
        return xss(data);
    }
    if (Array.isArray(data)) {
        return data.map(item => sanitizeObject(item));
    }
    if (data !== null && typeof data === 'object') {
        const cleaned = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                cleaned[key] = sanitizeObject(data[key]);
            }
        }
        return cleaned;
    }
    return data;
};



