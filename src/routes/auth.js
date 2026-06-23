import express from "express";
import {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser
} from "../controllers/user.controller.js";

import { fetchuser } from "../middleware/fetchuser.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/me", fetchuser, getCurrentUser);
router.post("/logout", fetchuser, logoutUser);

export default router;