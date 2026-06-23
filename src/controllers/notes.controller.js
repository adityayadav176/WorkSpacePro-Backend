import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Notes} from "../models/Notes.model.js"
import mongoose from "mongoose"
import { fetchuser } from "../middleware/fetchuser.js"

const createNote = asyncHandler(async (req, res) => {
    const { title, description, tag } = req.body;

    if (!title || !description || !tag) {
        throw new ApiError(400, "Title Description And Tag are required");
    }

    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "Unauthenticated Access Denied");
    }

    const note = await Notes.create({
        title: title.trim(),
        description: description.trim(),
        tag: tag,
        user: userId,
    });

    if (!note) {
        throw new ApiError(500, "Failed to create note");
    }

    return res.status(201).json(
        new ApiResponse(201, note, "Note created successfully")
    );
});

const deleteNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;

    if (!noteId || !mongoose.isValidObjectId(noteId)) {
        throw new ApiError(400, "Invalid Note ID");
    }

    const deletedNote = await Notes.findOneAndDelete({
        _id: noteId,
        user: req.user._id,
    });

    if (!deletedNote) {
        throw new ApiError(404, "Note not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Note deleted successfully")
    );
});

const updateNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;
    const { title, description, tag } = req.body;

    if (!noteId || !mongoose.isValidObjectId(noteId)) {
        throw new ApiError(400, "Invalid Note ID");
    }

    const note = await Notes.findOneAndUpdate(
            {
                _id: noteId,
                user: req.user._id
            },
            {
                $set: {
                    title,
                    description,
                    tag,
                }
            },
            { new: true }
        );

    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    return res.status(200).json(
        new ApiResponse(200, note, "Note updated successfully")
    );
});

const getAllNotes = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const { search, tag } = req.query;

    const query = {
        user: userId
    };

    if (search?.trim()) {
        query.$text = {
            $search: search.trim()
        };
    }

    if (tag) {
        query.tag = tag.toLowerCase();
    }

    const notes = await Notes.find(query)
        .sort(
            search
                ? { score: { $meta: "textScore" } }
                : { createdAt: -1 }
        )
        .skip(skip)
        .limit(limit);

    const totalNotes = await Notes.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                notes,
                pagination: {
                    totalNotes,
                    currentPage: page,
                    totalPages: Math.ceil(totalNotes / limit),
                    hasNextPage: page * limit < totalNotes,
                    hasPrevPage: page > 1
                }
            },
            "Notes fetched successfully"
        )
    );
});

export {
    createNote,
    deleteNote,
    updateNote,
    getAllNotes
}