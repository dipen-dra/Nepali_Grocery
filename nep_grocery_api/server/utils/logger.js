import winston from 'winston';
import 'winston-daily-rotate-file';

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    })
);

// Define transports (Where logs go)
const transports = [
    // 1. Console (For Developers)
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }),

    // 2. Audit Log (Suspicious Activity: 401, 403, Login Failures)
    // "warn" level will capture warnings and errors
    new winston.transports.DailyRotateFile({
        filename: 'logs/%DATE%-audit.log',
        datePattern: 'YYYY-MM-DD',
        level: 'warn',
        zippedArchive: true, // Compress old logs to save space
        maxSize: '20m',
        maxFiles: '90d' // Keep logs for 90 days (User asked for history)
    }),

    // 3. Error Log (System Crashes: 500s)
    new winston.transports.DailyRotateFile({
        filename: 'logs/%DATE%-error.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '90d'
    }),

    // 4. Combined Access Log (Everything)
    new winston.transports.DailyRotateFile({
        filename: 'logs/%DATE%-access.log',
        datePattern: 'YYYY-MM-DD',
        level: 'info',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d' // Keep general traffic for 30 days
    })
];

// Create the logger instance
const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: transports
});

export default logger;
