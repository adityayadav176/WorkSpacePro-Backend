const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');

//get All Notes: get "/api/auth/fetchallnotes" required Login.
router.get('/fetchallnotes', fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Some Error Occurred" });
  }
});

//Add Notes: POST "/api/auth/addnote" required Login.
router.post(
  '/addnote',
  [
    body('title').isLength({ min: 3 }),
    body('description', 'description must Be Atleast 5 Character').isLength({ min: 5 })
  ],
  fetchuser,
  async (req, res) => {

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      const { title, description, tag } = req.body;

      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id
      });

      const saveNotes = await note.save();
      res.json(saveNotes);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Some Error Occurred" });
    }

  }
);

//Delete existing Notes: DELETE "/api/auth/deletenote" required Login.
router.post(
  '/deletenote/:id', fetchuser, async (req, res) => {
    res.send("working deletenote");
  });
module.exports = router;


//update an existing Notes: PUT "/api/auth/updatenotes" required Login.
router.put('/updatenote/:id', fetchuser, async (req, res) => {
  const {title, description, tag} = req.body

  const newNote = {};
  if(title){newNote.title = title};
  if(description){newNote.description = description};
  if(title){newNote.tag = tag};

  // find the note to be updated and updated it
  let note = await Notes.findById(req.params.id)
  if(!note){ return res.status(404).send("NOT FOUND")}

  if(note.user.toString() !== req.user.id){
    return res.status(401).send("NOT ALLOWED")
  }

  note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true})
  res.json({note})

 });
module.exports = router;
