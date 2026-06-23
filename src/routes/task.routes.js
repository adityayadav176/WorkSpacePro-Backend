import express from "express";
import { fetchuser } from "../middleware/fetchuser.js";

import {
    getAllTasks,
    addTask,
    updateTask,
    deleteTask
} from "../controllers/task.controller.js";

const router = express.Router();

router.get("/fetchAllTask", fetchuser, getAllTasks);
router.post("/addTask", fetchuser, addTask);
router.patch("/updateTask/:TaskId", fetchuser, updateTask);
router.delete("/deleteTask/:TaskId", fetchuser, deleteTask);

export default router;