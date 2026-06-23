import Router from "express"
import { createNote, deleteNote, getAllNotes, updateNote } from "../controllers/notes.controller.js"
import { fetchuser } from "../middleware/fetchuser.js";

const router = Router();

router.post("/addNote", fetchuser, createNote);
router.delete("/deleteNote/:noteId",fetchuser, deleteNote);
router.patch("/updateNote/:noteId",fetchuser, updateNote);
router.get("/fetchAllNotes",fetchuser, getAllNotes);
export default router;
