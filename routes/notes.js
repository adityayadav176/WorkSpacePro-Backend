const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');

//get All Notes: get "/api/auth/fetchallnotes" required Login.
router.get('/fetchAllNotes', fetchuser, async (req, res) => {
  try {
    // fetch all notes for specific user
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
     // If Any Error Occured Then Show The Error 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Some Error Occurred" });
  }
});

//Add Notes: POST "/api/auth/addnote" required Login.
router.post('/addNote',  fetchuser,
  [
    body('title').isLength({ min: 3 }),
    body('description', 'description must Be Atleast 5 Character').isLength({ min: 5 })
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;

      const errors = validationResult(req);
      // If Any Error Occured in Validation Then Show The Error 
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      // Add New Notes Logic 
      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id
      });

      const saveNotes = await note.save();
      res.status(200).send({ success: true, saveNotes })

        // If Any Error Occured Then Show The Error 
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Some Error Occurred" });
    }

  }
);

//Delete existing Notes: DELETE "/api/auth/deletenote" required Login.
router.delete('/deleteNote/:id', fetchuser, async (req, res) => {
  try {
    // 1. Find the note
    let note = await Notes.findById(req.params.id);

    // 2. If note not found
    if (!note) {
      return res.status(404).send("Note not found");
    }

    // 3. Check ownership
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    // 4. Delete note
    note = await Notes.findByIdAndDelete(req.params.id);

    // 5. Send response
    res.json({ success: true, message: "Note deleted", note });

      // If Any Error Occured Then Show The Error 
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});
module.exports = router;


//update an existing Notes: PUT "/api/auth/updatenotes" required Login.
router.put('/updateNote/:id', [
  body('title').isLength({ min: 3 }),
  body('description', 'description must Be Atleast 5 Character').isLength({ min: 5 })
], fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body

    // create new object for store new notes
    const newNote = {};
    if (title) { newNote.title = title };
    if (description) { newNote.description = description };
    if (title) { newNote.tag = tag };

    // find the note to be updated and updated it
    let note = await Notes.findById(req.params.id)
    if (!note) { return res.status(404).send("NOT FOUND") }

    //check ownership
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("NOT ALLOWED")
    }

    // Updated notes logic
    note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })

    // 5. Send response
    res.json({ success: true, message: "Updated Successfully", note });

    // If Any Error Occured Then Show The Error 
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }

});
module.exports = router;
