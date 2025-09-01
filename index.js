import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authenticate from "./helpers/authenticate.js";
import userController from "./controller/userController.js";
import trainController from "./controller/trainController.js";
import scheduleController from "./controller/scheduleController.js";

dotenv.config();
const app = express();

const mongoUrl = process.env.MONGO_DB_URI;
const port = process.env.PORT;

app.use(express.json());
app.use(cors());
app.use(authenticate);

// MongoDB connection
mongoose.connect(mongoUrl);
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("Database connected");
});

//add endpoint here
app.use("/api/users", userController);
app.use("/api/trains", trainController);
app.use("/api/schedules", scheduleController);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
