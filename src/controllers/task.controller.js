import { Task } from "../models/Task.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const addTask = asyncHandler(async (req, res) => {
    const { title, description, priority, status } = req.body;

    if (!title || !description || !priority || !status) {
        throw new ApiError(400, "All Fields Are Required");
    }

    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "Unauthenticated Access Denied");
    }

    const task = await Task.create({
        title,
        description,
        priority,
        status,
        user: req.user._id
    });

    if (!task) {
        throw new ApiError(500, "Task Not Created");
    }

    return res.status(201).json({
        success: true,
        task
    });
});

const updateTask = asyncHandler(async (req, res) => {
    const { TaskId } = req.params;
    const { title, description, tag, priority, status } = req.body;

    if (!TaskId || !mongoose.isValidObjectId(TaskId)) {
        throw new ApiError(400, "Invalid Note ID");
    }

    const task = await Task.findOneAndUpdate(
        {
            _id: TaskId,
            user: req.user._id
        },
        {
            $set: {
                title,
                description,
                tag,
                priority,
                status
            }
        },
        { new: true }
    );

    if (!task) {
        throw new ApiError(404, "Task not found or not allowed");
    }

    return res.status(200).json(
        new ApiResponse(200, task, "Task Update Successfully")
    );
});

const deleteTask = asyncHandler(async (req, res) => {
    const { TaskId } = req.params;

    const task = await Task.findOneAndDelete({
        _id: TaskId,
        user: req.user._id
    });

    if (!task) {
        throw new ApiError(404, "Task not found or not allowed");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Task Deleted Successfully")
    );
});

const getAllTasks = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const { search, status, priority } = req.query;

    const query = {
        user: userId
    };

    if (search?.trim()) {
        query.$text = {
            $search: search.trim()
        };
    }

    if (status) {
        query.status = status;
    }

    if (priority) {
        query.priority = priority;
    }

    const tasks = await Task.find(query)
        .sort(
            search
                ? { score: { $meta: "textScore" } }
                : { createdAt: -1 }
        )
        .select(
            search
                ? { score: { $meta: "textScore" } }
                : {}
        )
        .skip(skip)
        .limit(limit);

    const totalTasks = await Task.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                tasks,
                pagination: {
                    totalTasks,
                    currentPage: page,
                    totalPages: Math.ceil(totalTasks / limit),
                    hasNextPage: page * limit < totalTasks,
                    hasPrevPage: page > 1,
                },
            },
            "Tasks fetched successfully"
        )
    );
});

export {
    addTask,
    updateTask,
    deleteTask,
    getAllTasks
}