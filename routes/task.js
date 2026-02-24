const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Task = require("../models/Task")
const { body, validationResult } = require('express-validator');


//ROUTE 1 Fetch All Tasks Using: POST "/api/auth/fetchAllTask" does't require auth
router.get('/fetchAllTask', fetchuser, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Some Error Occurred" });
  }
});
//ROUTE 2 Add Task: POST "/api/task/AddTask" required Login.
router.post('/addTask', fetchuser, [
  body('title').isLength({ min: 3 }),
  body('description', "Description must be atleast 5 character").isLength({ min: 5 }),
], async (req, res) => {
  try {
    
  const { title, description, priority, status } = req.body
  const errors = validationResult(req);
  // If Any Error Occured in Validation Then Show The Error 
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }
  // New Task Add Logic
  const newTask = new Task({
    title: title,
    description: description,
    priority: priority,
    status: status,
    user: req.user.id
  })
  // Task save
  const savedTask = await newTask.save()
  res.status(200).send({ success: true, savedTask: savedTask })
  // if error occured then send bad request and the error
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//ROUTE 3 update an existing Task: PUT "/api/auth/updateTask" required Login.
router.put('/updateTask/:id', [
  body('title').isLength({ min: 3 }),
  body('description', 'description must Be Atleast 5 Character').isLength({ min: 5 })
], fetchuser, async (req, res) => {
  try {
    const { title, description, tag, priority, status } = req.body

    // create new object for store new tasks
    const newTask = {};
    if (title) { newTask.title = title };
    if (description) { newTask.description = description };
    if (title) { newTask.tag = tag };
    if(priority){newTask.priority = priority}
    if(status){newTask.status = status}

    // find the task to be updated and updated it
    let task = await Task.findById(req.params.id)
    if (!task) { return res.status(404).send("NOT FOUND") }

    //check ownership
    if (task.user.toString() !== req.user.id) {
      return res.status(401).send("NOT ALLOWED")
    }

    // Updated tasks logic
    task = await Task.findByIdAndUpdate(req.params.id, { $set: newTask }, { new: true })

    // 5. Send response
    res.json({ success: true, message: "Updated Successfully", task });

    // If Any Error Occured Then Show The Error 
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  } 

});

//ROUTE 4 Delete existing Tasks: DELETE "/api/task/deleteTask" required Login.
router.delete('/deleteTask/:id', fetchuser, async (req, res) => {
  try {
    // 1. Find the Task
    let task = await Task.findById(req.params.id);

    // 2. If task not found
    if (!task) {
      return res.status(404).send("Task not found");
    }

    // 3. Check ownership
    if (task.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    // 4. Delete task
    task = await Task.findByIdAndDelete(req.params.id);

    // 5. Send response
    res.json({ success: true, message: "Task deleted"});

      // If Any Error Occured Then Show The Error 
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});


module.exports = router;
