import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import { authRouter } from "./routes/authRoutes.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));

//api endpoints
app.get("/", (req, res) => {
  res.send("API Working");
});
app.use("/api/auth", authRouter);

const port = process.env.PORT || 8000;
connectDB();

app.listen(port, () => {
  console.log(`Server Started On the Port: ${port}`);
});
