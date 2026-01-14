import express from 'express';
import {
    registerUser, loginUser, googleLogin, logoutUser, getUserProfile,
    updateUserProfilePicture, updateUserProfile, sendResetLink,
    resetPassword, verifyOtp, resendOtp, setUserPin, verifyUserPin
} from '../controllers/userController.js';
import { authenticateUser } from '../middleware/authorizedUser.js';
import multerUpload from '../middleware/multerUpload.js';

const router = express.Router();

import { loginLimiter } from '../middleware/loginLimiter.js';
import { registerLimiter } from '../middleware/registerLimiter.js';
import { otpVerifyLimiter, otpRequestLimiter } from '../middleware/otpLimiter.js';

// --- PUBLIC ROUTES ---
router.post('/register', registerLimiter, registerUser);
router.post('/login', loginLimiter, loginUser);
router.post('/google-login', loginLimiter, googleLogin); // Using login limiter for this too
router.post('/logout', logoutUser);

// --- 2FA ROUTES ---
router.post('/verify-otp', otpVerifyLimiter, verifyOtp);
router.post('/resend-otp', otpRequestLimiter, resendOtp);

// --- PROTECTED ROUTES ---
router.get('/profile', authenticateUser, getUserProfile);
router.put('/profile', authenticateUser, updateUserProfile);

router.put(
    '/profile/picture',
    authenticateUser,
    multerUpload.single('profilePicture'),
    updateUserProfilePicture
);
router.post(
    "/forgot-password",
    sendResetLink
);
router.post(
    "/reset-password/:token",
    resetPassword
);

// PIN Management
router.post('/set-pin', authenticateUser, setUserPin);
router.post('/verify-pin', authenticateUser, verifyUserPin);


export default router;