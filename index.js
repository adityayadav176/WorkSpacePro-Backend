require('dotenv').config();
const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/task', require('./routes/task'));

const startServer = async () => {
  await connectToMongo();   
  app.listen(process.env.PORT, "0.0.0.0", () => {
    console.log(`Workspace Server listening at http://localhost:${process.env.PORT}`);
  });
};

startServer();

