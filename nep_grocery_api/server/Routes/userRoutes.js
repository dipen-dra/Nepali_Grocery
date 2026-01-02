import express from 'express';
import { registerUser, loginUser, logoutUser, getUserProfile, updateUserProfilePicture, updateUserProfile, sendResetLink, resetPassword } from '../controllers/userController.js';
import { authenticateUser } from '../middleware/authorizedUser.js';
import multerUpload from '../middleware/multerUpload.js';

const router = express.Router();

import { loginLimiter } from '../middleware/loginLimiter.js';

import { registerLimiter } from '../middleware/registerLimiter.js';

// --- PUBLIC ROUTES ---
router.post('/register', registerLimiter, registerUser);
router.post('/login', loginLimiter, loginUser);
router.post('/logout', logoutUser);

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

export default router;