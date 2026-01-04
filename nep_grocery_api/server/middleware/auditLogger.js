import Log from '../models/Log.js';

/**
 * Logs an admin action to the database.
 * @param {Object} req - Express request object (containing user and ip)
 * @param {string} action - Description of the action (e.g., "Updated User")
 * @param {string} status - Result status (e.g., 200, 400, 500)
 * @param {Object} meta - Additional metadata (e.g., target user ID, changes)
 */
export const logAdminAction = async (req, action, status, meta = {}) => {
    try {
        // Safe extraction of IP
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        const logEntry = new Log({
            user: req.user ? req.user._id : null, // Admin performing the action
            method: req.method,
            url: req.originalUrl,
            status: status,
            ip: ip,
            userAgent: req.headers['user-agent'],
            meta: {
                action: action,
                ...meta
            }
        });

        await logEntry.save();
    } catch (error) {
        console.error("Audit Logging Failed:", error);
        // We do not throw here to prevent blocking the actual response if logging fails
    }
};
