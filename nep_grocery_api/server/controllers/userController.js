// import User from "../models/User.js";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import nodemailer from "nodemailer";


// const createUserData = (user) => ({
//     _id: user._id,
//     fullName: user.fullName,
//     email: user.email,
//     role: user.role,
//     profilePicture: user.profilePicture,
//     createdAt: user.createdAt,
//     location: user.location,
//     groceryPoints: user.groceryPoints,
// });

// // Register new user
// export const registerUser = async (req, res) => {
//     const { email, fullName, password } = req.body;
//     if (!email || !fullName || !password) {
//         return res.status(400).json({ success: false, message: "Please fill all fields." });
//     }
//     try {
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ success: false, message: "User with this email already exists." });
//         }
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newUser = new User({
//             email,
//             fullName,
//             password: hashedPassword,
//             groceryPoints: 0, // Initialize with 0 points
//         });
//         await newUser.save();
//         res.status(201).json({
//             success: true,
//             message: "User registered successfully.",
//             data: createUserData(newUser),
//         });
//     } catch (error) {
//         console.error("Registration Error:", error);
//         res.status(500).json({ success: false, message: "Server error during registration." });
//     }
// };

// // Login
// export const loginUser = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         if (!email || !password) {
//             return res.status(400).json({ success: false, message: "Email and password are required." });
//         }

//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(401).json({ success: false, message: "Invalid email or password." });
//         }

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(401).json({ success: false, message: "Invalid email or password." });
//         }

//         if (!process.env.SECRET) {
//             throw new Error("JWT Secret is not defined in the .env file.");
//         }

//         const token = jwt.sign({ _id: user._id, role: user.role }, process.env.SECRET, { expiresIn: "1d" });

//         res.status(200).json({
//             success: true,
//             token,
//             data: createUserData(user),
//         });
//     } catch (error) {
//         console.error("Login error:", error);
//         res.status(500).json({ success: false, message: "Server error during login." });
//     }
// };

// // Get Profile
// export const getUserProfile = async (req, res) => {
//     try {
//         const user = await User.findById(req.user._id).select("-password");
//         if (!user) {
//             return res.status(404).json({ success: false, message: "User not found" });
//         }
//         res.status(200).json({ success: true, data: user });
//     } catch (error) {
//         console.error("Get Profile Error:", error);
//         res.status(500).json({ success: false, message: "Server error while fetching profile" });
//     }
// };

// // Update Profile Info
// export const updateUserProfile = async (req, res) => {
//     const { fullName, email, location } = req.body;
//     try {
//         const user = await User.findById(req.user._id);
//         if (!user) {
//             return res.status(404).json({ success: false, message: "User not found" });
//         }

//         user.fullName = fullName || user.fullName;
//         user.email = email || user.email;
//         user.location = location !== undefined ? location : user.location;

//         const updatedUser = await user.save();

//         res.status(200).json({
//             success: true,
//             message: "Profile updated successfully",
//             data: createUserData(updatedUser),
//         });
//     } catch (error) {
//         console.error("Update Profile Error:", error);
//         res.status(500).json({ success: false, message: "Server error while updating profile" });
//     }
// };

// // Update Profile Picture
// export const updateUserProfilePicture = async (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ success: false, message: "No file uploaded." });
//     }
//     try {
//         const user = await User.findById(req.user._id);
//         if (!user) {
//             return res.status(404).json({ success: false, message: "User not found." });
//         }

//         user.profilePicture = `/images/profile-pictures/${req.file.filename}`;
//         const updatedUser = await user.save();

//         res.status(200).json({
//             success: true,
//             message: "Profile picture updated successfully.",
//             data: createUserData(updatedUser),
//         });
//     } catch (error) {
//         console.error("Profile picture update error:", error);
//         res.status(500).json({ success: false, message: "Server error during file update." });
//     }
// };

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });


// export const sendResetLink = async (req, res) => {
//     const { email } = req.body;

//     if (!email) {
//         return res.status(400).json({ success: false, message: "Email is required" });
//     }

//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(200).json({
//                 success: true,
//                 message: "If an account with that email exists, a reset link has been sent.",
//             });
//         }

//         const token = jwt.sign(
//             { id: user._id },
//             process.env.SECRET,
//             { expiresIn: "15m" }
//         );

//         const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

//         const mailOptions = {
//             from: `'Hamro Grocery' <${process.env.EMAIL_USER}>`,
//             to: email,
//             subject: "Reset Your Grocery Password",
//             html: `
//                 <p>Hello ${user.fullName},</p>
//                 <p>You requested a password reset. Please click the link below to create a new password:</p>
//                 <a href="${resetUrl}" style="background-color: #1a202c; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a>
//                 <p>This link will expire in 15 minutes.</p>
//                 <p>If you did not request this, please ignore this email.</p>
//             `,
//         };

//         transporter.sendMail(mailOptions, (err, info) => {
//             if (err) {
//                 console.error("Error sending email:", err);
//                 return res.status(500).json({
//                     success: false,
//                     message: "Failed to send reset email. Please try again later.",
//                 });
//             }

//             return res.status(200).json({
//                 success: true,
//                 message: "If an account with that email exists, a reset link has been sent.",
//             });
//         });

//     } catch (err) {
//         console.error("Forgot Password Error:", err);
//         return res.status(500).json({
//             success: false,
//             message: "Server error. Please try again."
//         });
//     }
// };

// export const resetPassword = async (req, res) => {
//     const { token } = req.params;
//     const { password } = req.body;

//     if (!password) {
//         return res.status(400).json({ success: false, message: "Password is required" });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.SECRET);
//         const userId = decoded.id;
//         const hashedPassword = await bcrypt.hash(password, 10);
//         await User.findByIdAndUpdate(userId, { password: hashedPassword });

//         return res.status(200).json({
//             success: true,
//             message: "Password has been reset successfully.",
//         });

//     } catch (err) {
//         if (err.name === 'JsonWebTokenError') {
//             return res.status(401).json({ success: false, message: "Invalid token." });
//         }
//         if (err.name === 'TokenExpiredError') {
//             return res.status(401).json({ success: false, message: "Token has expired. Please request a new reset link." });
//         }

//         console.error("Reset Password Error:", err);
//         return res.status(500).json({ success: false, message: "Server Error" });
//     }
// };

import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from 'crypto';

// Helper function to create user data payload
// Helper function to format user data
const createUserData = (user) => ({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    profilePicture: user.profilePicture,
    createdAt: user.createdAt,
    location: user.location,
    groceryPoints: user.groceryPoints,
    twoFactorEnabled: user.twoFactorEnabled, // Added for frontend toggle state
});

const sendOtpEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `'NepGrocery' <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Login OTP",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c5282;">Login Verification</h2>
                <p>Your One-Time Password (OTP) for login is:</p>
                <h1 style="background-color: #f0fdf4; color: #15803d; padding: 20px; text-align: center; letter-spacing: 5px; border-radius: 10px;">${otp}</h1>
                <p>This code expires in 10 minutes.</p>
                <p style="color: #666; font-size: 12px; margin-top: 20px;">If you didn't request this, please change your password immediately.</p>
            </div>
        `
    };
    await transporter.sendMail(mailOptions);
};

const generateSecureOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Register new user
export const registerUser = async (req, res) => {
    const { email, fullName, password, captchaToken } = req.body;
    if (!email || !fullName || !password) {
        return res.status(400).json({ success: false, message: "Please fill all fields." });
    }

    if (!captchaToken) {
        return res.status(400).json({ success: false, message: "Captcha token is missing." });
    }

    // Verify Captcha with Google's API to ensure the request is from a human
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
    const captchaResponse = await fetch(verificationUrl, { method: 'POST' });
    const captchaData = await captchaResponse.json();

    if (!captchaData.success) {
        return res.status(400).json({ success: false, message: "Captcha verification failed. Please try again." });
    }

    // Password Validation: Cannot contain user's name
    const nameParts = fullName.toLowerCase().split(' ');
    const lowerPassword = password.toLowerCase();

    for (const part of nameParts) {
        if (part.length > 2 && lowerPassword.includes(part)) { // >2 chars to avoid blocking short common bits
            return res.status(400).json({
                success: false,
                message: `Password cannot contain your name ("${part}"). Please choose a stronger password.`
            });
        }
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        });
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User with this email already exists." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email,
            fullName,
            password: hashedPassword,
            groceryPoints: 0,
        });
        await newUser.save();
        res.status(201).json({
            success: true,
            message: "User registered successfully.",
            data: createUserData(newUser),
        });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ success: false, message: "Server error during registration." });
    }
};

import fetch from 'node-fetch';

// Login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        // --- 2FA LOGIC ---
        if (user.twoFactorEnabled) {
            const otp = generateSecureOtp();
            user.otp = otp;
            user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
            await user.save();

            // Send OTP Email
            try {
                await sendOtpEmail(user.email, otp);
            } catch (emailError) {
                console.error("Failed to send OTP email:", emailError);
                return res.status(500).json({ success: false, message: "Failed to send verification code." });
            }

            // Mask email for privacy in response (e.g., d***@gmail.com)
            const maskedEmail = user.email.replace(/^(...)(.*)(@.*)$/, "$1***$3");

            return res.status(200).json({
                success: true,
                requires2FA: true,
                userId: user._id,
                message: `Verification code sent to ${maskedEmail}`
            });
        }
        // --- END 2FA LOGIC (Blocks login until OTP is verified) ---

        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.SECRET, { expiresIn: "7d" });

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            role: user.role, // Return role for frontend redirect logic
            token, // Return token for header-based auth
            data: createUserData(user),
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Server error during login." });
    }
};

// Logout
export const logoutUser = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ success: false, message: "Server error during logout." });
    }
};

// Send Password Reset Link
export const sendResetLink = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If an account with that email exists, a reset link has been sent.",
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: "15m" });
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

        const mailOptions = {
            from: `'NepGrocery' <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Reset Your NepGrocery Password",
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #2c5282;">Password Reset Request</h2>
                    <p>Hello ${user.fullName},</p>
                    <p>You requested a password reset. Please click the button below to create a new password. This link is valid for 15 minutes.</p>
                    <p style="text-align: center; margin: 20px 0;">
                        <a href="${resetUrl}" style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
                    </p>
                    <p>If you did not request this, please ignore this email. Your password will not be changed.</p>
                    <hr style="border: none; border-top: 1px solid #eee;" />
                    <p style="font-size: 0.8em; color: #777;">NepGrocery Team</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: "If an account with that email exists, a reset link has been sent.",
        });

    } catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({
            success: false,
            message: "An error occurred while trying to send the reset email."
        });
    }
};

// Reset Password
export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    // --- DEBUGGING LOGS ADDED HERE ---
    console.log("\n--- Reset Password Attempt ---");
    console.log("Received Token:", token);
    console.log("Secret Key Used for Verification:", process.env.SECRET ? "Loaded" : "!!! UNDEFINED !!!");
    // --- END DEBUGGING ---

    if (!password) {
        return res.status(400).json({ success: false, message: "Password is required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        const userId = decoded.id;
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(userId, { password: hashedPassword });

        return res.status(200).json({
            success: true,
            message: "Password has been reset successfully.",
        });

    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            // Log the specific error before sending the response
            console.error("JsonWebTokenError:", err.message);
            return res.status(401).json({ success: false, message: "Invalid or malformed token." });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Token has expired. Please request a new reset link." });
        }
        console.error("Reset Password Error:", err);
        return res.status(500).json({ success: false, message: "An internal server error occurred." });
    }
};

// Get Profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ success: false, message: "Server error while fetching profile" });
    }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
        return res.status(400).json({ success: false, message: "User ID and OTP are required." });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (!user.otp || !user.otpExpires) {
            return res.status(400).json({ success: false, message: "No OTP request found. Please login again." });
        }

        if (Date.now() > user.otpExpires) {
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return res.status(400).json({ success: false, message: "OTP has expired. Please login again to get a new code." });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
        }

        // --- OTP VALID ---
        // Clear OTP fields
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.SECRET, { expiresIn: "7d" });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            role: user.role,
            token,
            data: createUserData(user),
        });

    } catch (error) {
        console.error("OTP verification error:", error);
        res.status(500).json({ success: false, message: "Server error during verification." });
    }
};

// Resend OTP
export const resendOtp = async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (!user.twoFactorEnabled) {
            return res.status(400).json({ success: false, message: "2FA is not enabled for this account." });
        }

        const otp = generateSecureOtp();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        await sendOtpEmail(user.email, otp);

        res.status(200).json({
            success: true,
            message: "New verification code sent."
        });
    } catch (error) {
        console.error("Resend OTP error:", error);
        res.status(500).json({ success: false, message: "Failed to resend OTP." });
    }
};

// Update Profile Info
export const updateUserProfile = async (req, res) => {
    const { fullName, email, location, twoFactorEnabled } = req.body;
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if email is being updated and if it's already taken
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: "Email is already in use by another account." });
            }
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.location = location !== undefined ? location : user.location;
        if (twoFactorEnabled !== undefined) {
            user.twoFactorEnabled = twoFactorEnabled;
        }

        const updatedUser = await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: createUserData(updatedUser),
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ success: false, message: "Server error while updating profile" });
    }
};

// Update Profile Picture
export const updateUserProfilePicture = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded." });
    }
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        user.profilePicture = `/images/profile-pictures/${req.file.filename}`;
        const updatedUser = await user.save();

        res.status(200).json({
            success: true,
            message: "Profile picture updated successfully.",
            data: createUserData(updatedUser),
        });
    } catch (error) {
        console.error("Profile picture update error:", error);
        res.status(500).json({ success: false, message: "Server error during file update." });
    }
};

import { OAuth2Client } from 'google-auth-library';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Login
export const googleLogin = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ success: false, message: "Google token is required." });
    }

    try {
        // Verify the token with Google
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();

        // Security Check 1: Verified Email
        if (!payload.email_verified) {
            return res.status(403).json({ success: false, message: "Your Google email is not verified." });
        }

        const email = payload.email;
        const fullName = payload.name;
        const picture = payload.picture;

        let user = await User.findOne({ email });

        if (user) {
            // Security Check 2: Merging Logic
            // If user exists, we log them in. 
            // We assume Google's verification of ownership is sufficient proof.
        } else {
            // Security Check 3: Role Escalation Prevention
            // Create new user with FORCE role 'normal'
            user = new User({
                email,
                fullName,
                password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10), // Random password
                role: 'normal',
                profilePicture: picture,
                groceryPoints: 0,
                isGoogleAuth: true // Optional flag for future use
            });
            await user.save();
        }

        // Issue JWT similar to standard login
        const jwtToken = jwt.sign({ _id: user._id, role: user.role }, process.env.SECRET, { expiresIn: "7d" });

        res.cookie('token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            success: true,
            message: "Google Login successful",
            role: user.role,
            token: jwtToken,
            data: createUserData(user),
        });

    } catch (error) {
        console.error("Google Login Error:", error);
        res.status(500).json({ success: false, message: "Google authentication failed." });
    }
};
