const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
// Todo improvement and small mistake database queries and 

//Create a User using: POST "/api/auth/createuser" does't require auth

router.post('/createuser', [
  body('email', 'Enter A valid Email').isEmail(),
  body('name', 'Enter A valid Name').isLength({ min: 3 }),
  body('password', 'Password must Be Atleast 6 Character').isLength({ min: 6 }),
  body('mobileNo', 'Enter A valid MobileNo').isMobilePhone()
], async (req, res) => {
  const { name, email, password, mobileNo } = req.body;
  try {
    const errors = validationResult(req);
    // If there are some errors Return bad request and the error
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    // Check Whether the user with this mobile number already exists 
    let mobileUser = await User.findOne({mobileNo})
    if(mobileUser){
      return res.status(400).json({ error: "Sorry A User With This Mobile No Already Exists!" });
    }
    // Check Whether the user with this email already exists 
    let emailUser = await User.findOne({ email });
    if (emailUser) {
      return res.status(400).json({ error: "Sorry A User With This Email Already Exists!" });
    } else {
      const salt = await bcrypt.genSalt(10);//Generate Salt Using Bcrypt package
      const secPass = await bcrypt.hash(password, salt);

      //Create A New Use
     let user = await User.create({ name, email, password: secPass, mobileNo })
      res.status(200).json({ success: true, user: user })
    }
  } catch (error) {
    console.error(error);
    // If there are some errors Return bad request and the error 
    res.status(400).json({error: 'Please Enter Unique Value For Email & mobileNo' });
  }

});

module.exports = router;
