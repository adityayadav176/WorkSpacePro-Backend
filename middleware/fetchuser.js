let jwt = require('jsonwebtoken');
const JWT_SECRET = 'MyNameIsAdityaIamAutherOfWorkspace'

fetchuser = (req, res, next) =>{
    const token = req.header('auth-token');
    if(!token){
        return res.status(401).send("Access Denied");
    }
    try {
         const data = jwt.verify(token, JWT_SECRET)
    req.user = data.user; // user Id
    next();
    } catch (error) {
         return res.status(401).send("Access Denied");
    }
   
}

module.exports = fetchuser;  