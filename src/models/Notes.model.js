import mongoose, { Schema } from "mongoose";

const NotesSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 100
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        tag: {
            type: String,
            required: true,
            enum: [
                "study",
                "work",
                "personal",
                "interview",
                "project",
                "important"
            ],
            lowercase: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

NotesSchema.index({ user: 1, createdAt: -1 });
NotesSchema.index({ title: "text", description: "text" });

export const Notes = mongoose.model("Notes", NotesSchema);