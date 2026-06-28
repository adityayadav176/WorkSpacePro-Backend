import express from "express";
import {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
    forgotPassword,
    resetPassword
} from "../controllers/user.controller.js";

import { fetchuser } from "../middleware/fetchuser.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/me", fetchuser, getCurrentUser);
router.post("/logout", fetchuser, logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;