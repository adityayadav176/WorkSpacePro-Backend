require('dotenv').config();
const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/task', require('./routes/task'));

const startServer = async () => {
  await connectToMongo();   
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Workspace Server listening at http://localhost:${PORT}`);
  });
};

startServer();

