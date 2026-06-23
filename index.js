import dotenv from "dotenv";
import cors from "cors";
import { connectToMongo } from "./db.js";
import express from "express";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cookieParser());
app.use(cors());
app.use(express.json());

import authRouter from "./src/routes/auth.routes.js"
import NoteRouter from "./src/routes/notes.routes.js"
import taskRouter from "./src/routes/task.routes.js"

app.use('/api/notes', NoteRouter);
app.use('/api/auth', authRouter);
app.use('/api/task', taskRouter);

const startServer = async () => {
  await connectToMongo();
  app.listen(PORT, () => {
    console.log(`Workspace Server listening at http://localhost:${PORT}`);
  });
};

startServer();