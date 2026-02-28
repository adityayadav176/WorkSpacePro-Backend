const connectToMongo = require('./db')
const express = require('express')
const cors1 = require('cors')

connectToMongo();
const app = express()
const port = 8000

const cors = require("cors");
app.use(cors());

app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))
app.use('/api/task', require('./routes/task'))

app.listen(port, "0.0.0.0", () => { 
  console.log(`Workspace Server listening at http://localhost:${port}`)
})
