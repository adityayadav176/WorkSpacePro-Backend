import dotenv from "dotenv";
import cors from "cors";
import { connectToMongo } from "./db.js";
import express from "express";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "https://work-space-pro-frontend-l8bx-fq5mp9i3r.vercel.app", 
      "http://localhost:3000",
      "http://localhost:5173"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

app.use("/", (req, res) => {
  res.send("API IS WORKING....");
})

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