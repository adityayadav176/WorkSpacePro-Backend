import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {notes} from "../models/Notes.js"
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

    const note = await notes.create({
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
    const { title, description, tags } = req.body;

    if (!noteId || !mongoose.isValidObjectId(noteId)) {
        throw new ApiError(400, "Invalid Note ID");
    }

    const note = await notes.findOne({
        _id: noteId,
        user: req.user._id,
    });

    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    if (title !== undefined) note.title = title.trim();
    if (description !== undefined) note.description = description.trim();

    if (tags !== undefined) {
        note.tags = tags.map(tag => tag.trim().toLowerCase());
    }

    const updatedNote = await note.save();

    return res.status(200).json(
        new ApiResponse(200, updatedNote, "Note updated successfully")
    );
});

const getAllNotes = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const search = req.query.search || "";

    const query = {
        user: userId,
        title: { $regex: search, $options: "i" }, // case-insensitive search
    };

    const Notes = await notes.find(query)
        .sort({ createdAt: -1 }) // latest first
        .skip(skip)
        .limit(limit);

    const totalNotes = await notes.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            Notes,
            pagination: {
                totalNotes,
                currentPage: page,
                totalPages: Math.ceil(totalNotes / limit),
                hasNextPage: page * limit < totalNotes,
            },
        }, "Notes fetched successfully")
    );
});

export {
    createNote,
    deleteNote,
    updateNote,
    getAllNotes
}