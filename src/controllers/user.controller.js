import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, mobileNo } = req.body;

    const existingUser = await User.findOne({
        $or: [{ email }, { mobileNo }]
    });

    if (existingUser) {
        throw new ApiError(400, "User already exists");
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

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",          
        maxAge: 7 * 24 * 60 * 60 * 1000 
    }

    return res.status(200)
    .cookie("token", token, options)
    .json(
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

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    };

    return res
        .status(200)
        .clearCookie("token", options)
        .json(
            new ApiResponse(200, null, "Logged out successfully")
        );
});

export {
    loginUser,
    logoutUser,
    registerUser,
    getCurrentUser
}