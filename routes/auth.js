const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
const JWT_SECRET = 'MyNameIsAdityaIamAutherOfWorkspace'

// Todo improvement env.local salt and jwt token  and small mistake database queries and 
//Create a User using: POST "/api/auth/Signup" does't require auth

router.post('/Signup', [
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
    let mobileUser = await User.findOne({ mobileNo })
    if (mobileUser) {
      return res.status(400).json({ error: "Sorry A User With This Mobile No Already Exists!" });
    }
    // Check Whether the user with this email already exists 
    let emailUser = await User.findOne({ email });
    // If user with this email already exists than show bad request and the error
    if (emailUser) {
      return res.status(400).json({ error: "Sorry A User With This Email Already Exists!" });
    } else {
      //Generate Salt Using Bcrypt package
      const salt = await bcrypt.genSalt(10);
      //Bcrypt.hash method
      const secPass = await bcrypt.hash(password, salt);

      //Create A New Use
      let user = await User.create({ name, email, password: secPass, mobileNo })
      // Send Id For jwt token 
      const data = {
        user: {
          id: user.id
        }
      }
      const authtoken = jwt.sign(data, JWT_SECRET)
      res.status(200).json({ success: true, user: authtoken })
    }
  } catch (error) {
    console.error(error);
    // IF THERE ARE SOME ERROR THAN RETURN BAD REQUEST AND THE ERROR 
    res.status(400).json({ error: "Some Error Occurred" });
  }
});
 // ROUTE 2: Authenticate a User using: POST "/api/auth/login" does't require auth

router.post('/login', [
  body('password', 'Password Cannot Be Blank').exists()
], async (req, res) => {
  // IF THERE ARE SOME ERROR THAN RETURN BAD REQUEST AND THE ERROR 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, mobileNo } = req.body;

  try {
    // IF MOBILE "" AND EMAIL "" THAN RETURN BAD REQUEST AND THE ERROR
    if (!email && !mobileNo) {
      return res.status(400).json({ error: "Email or Mobile required" });
    }
    // Find the user and mobile
    let user = await User.findOne({
      $or: [{ email }, { mobileNo }]
    });
    // IF NOT OF MOBILE AND NOT OF EMAIL THAN RETURN BAD REQUEST AND THE ERROR
    if (!user) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    const passCompare = await bcrypt.compare(password, user.password);
    // IF USER PASSWORD DOES'T EQUAL TO PASSWORD THAN RETURN BAD REQUEST AND THE ERROR
    if (!passCompare) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }
    // CHECK USER ID AND VARIFY THE AUTHENTICATION TOKEN
    const data = {
      user: { id: user.id }
    };
    // CHECK THE USER
    const authtoken = jwt.sign(data, JWT_SECRET);
    // SEND THE RESPONSE 
    res.status(200).json({ success: true, authtoken });
    // IF THERE ARE SOME ERROR THAN RETURN BAD REQUEST AND THE ERROR 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//get loggdin user details: POST "/api/auth/getuser" does't require auth
router.get('/getuser', fetchuser, async (req, res) => {
  try {
    //FROM MIDDLEWARE
    const userId = req.user.id;
    //IGNORE THE PASSWORD
    const user = await User.findById(userId).select("-password");
    res.send(user);
     // IF THERE ARE SOME ERROR THAN RETURN BAD REQUEST AND THE ERROR 
  } catch (error) {
    res.status(500).send("Server Error");
  }
});
module.exports = router;
