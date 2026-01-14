

export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    console.error(err.stack);

    res.status(statusCode).json({
        success: false,
        message: statusCode === 500
            ? 'An unexpected error occurred on the server.'
            : err.message
    });
};
