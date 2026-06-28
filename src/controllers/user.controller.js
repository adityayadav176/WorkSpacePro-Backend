import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { compareOTP, generateOTP, hashOTP } from "../utils/generateOtp.js";
import { sendEmail } from "../utils/nodemailer.js";
import { passwordResetOTPTemplate } from "../utils/template.js";

const getCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production";
    return {
        path: "/",
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };
};

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, mobileNo } = req.body;

    if (!name || !email || !password || !mobileNo) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{ email }, { mobileNo }]
    });

    if (existingUser) {
        throw new ApiError(400, "User with this email or mobile number already exists");
    }

    const user = await User.create({
        name,
        email,
        password,
        mobileNo
    });

    const safeUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNo: user.mobileNo
    };

    return res.status(201).json(
        new ApiResponse(201, { user: safeUser }, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, mobileNo, password } = req.body;

    if (!email && !mobileNo) {
        throw new ApiError(400, "Email or mobile required");
    }

    if (!password) {
        throw new ApiError(400, "Password required");
    }

    const user = await User.findOne({
        $or: [{ email }, { mobileNo }]
    }).select("+password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        throw new ApiError(401, "Invalid credentials");
    }

    const token = jwt.sign(
        { _id: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "7d" }
    );

    const safeUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNo: user.mobileNo
    };

    res.cookie("token", token, getCookieOptions());

    return res.status(200).json(
        new ApiResponse(200, { user: safeUser, token }, "Login successful")
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "User fetched successfully")
    );
});

const logoutUser = asyncHandler(async (req, res) => {
    const options = getCookieOptions();
    delete options.maxAge;

    return res
        .status(200)
        .clearCookie("token", options)
        .json(new ApiResponse(200, null, "Logged out successfully"));
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });

    // Always same response for security
    if (!user) {
        return res.status(200).json(
            new ApiResponse(200, {}, "If an account exists, an OTP has been sent.")
        );
    }

    const ONE_HOUR = 60 * 60 * 1000;

    // Reset window if an hour has actually passed since the FIRST request
    if (user.otpRequestTime && (Date.now() - user.otpRequestTime > ONE_HOUR)) {
        user.otpRequestCount = 0;
        user.otpRequestTime = undefined; // Clear it so it initializes fresh
    }

    // Initialize tracking fields if they don't exist
    if (!user.otpRequestTime || user.otpRequestCount === 0) {
        user.otpRequestTime = Date.now(); // Lock the window baseline here
        user.otpRequestCount = 0;
    }

    // Rate limit check
    if (user.otpRequestCount >= 3) {
        throw new ApiError(429, "Too many OTP requests. Try again after 1 hour.");
    }

    // Auto clear expired OTP
    if (user.resetPasswordOTPExpire && user.resetPasswordOTPExpire < Date.now()) {
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpire = undefined;
    }

    // Block active OTP
    if (user.resetPasswordOTP && user.resetPasswordOTPExpire > Date.now()) {
        throw new ApiError(429, "OTP already sent. Please wait before requesting a new one.");
    }

    const otp = generateOTP();

    user.resetPasswordOTP = await hashOTP(otp, 10);
    user.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000;

    user.otpRequestCount += 1;

    await user.save({ validateBeforeSave: false });

    await sendEmail({
        to: user.email,
        subject: "Workspace Pro Password Reset OTP",
        html: passwordResetOTPTemplate(otp),
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "OTP sent successfully.")
    );
});

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({
        email,
        resetPasswordOTPExpire: { $gt: Date.now() }
    }).select("+password resetPasswordOTP resetPasswordOTPExpire");

    if (!user) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    const isOTPValid = await compareOTP(otp, user.resetPasswordOTP);

    if (!isOTPValid) {
        throw new ApiError(400, "Invalid OTP");
    }

    user.password = password;

    // clear OTP data
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;

    // reset counters safely
    user.otpRequestCount = 0;
    user.otpRequestTime = Date.now();

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset successfully.")
    );
});

export {
    loginUser,
    logoutUser,
    registerUser,
    getCurrentUser,
    resetPassword,
    forgotPassword
};