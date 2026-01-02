import Log from '../models/Log.js';

export const activityLogger = (req, res, next) => {
    const start = Date.now();

    // Hook into response 'finish' event to log after the response is sent
    res.on('finish', async () => {
        try {
            // Check if request was authenticated (req.user exists)
            const userId = req.user ? req.user._id : undefined;

            await Log.create({
                user: userId,
                method: req.method,
                url: req.originalUrl || req.url,
                status: res.statusCode,
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.get('user-agent'),
                meta: {
                    responseTimeMs: Date.now() - start,
                    contentLength: res.get('content-length')
                }
            });
        } catch (error) {
            console.error('Activity Logging Error:', error);
            // Don't crash the request if logging fails
        }
    });

    next();
};
