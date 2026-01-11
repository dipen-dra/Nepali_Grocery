import mongoose from "mongoose";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "normal",
    },
    profilePicture: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    // --- NEW FIELD ---
    groceryPoints: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    securityPin: {
      type: String, // Will be hashed
    },
    // --- 2FA FIELDS ---
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    // --- SECURITY LOGS ---
    loginHistory: [{
      ip: String,
      coordinates: { lat: Number, lon: Number }, // from geoip-lite
      timestamp: { type: Date, default: Date.now }
    }],
    // --- PASSWORD SECURITY ---
    passwordHistory: [{ type: String }], // Stores last 5 hashed passwords
    passwordLastChangedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;