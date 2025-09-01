import express from "express";
import {
  createTrain,
  getAllTrains,
  getTrainById,
  updateTrain,
  deleteTrain,
  filterAvailableTrains,
} from "../service/trainService.js";

const trainController = express.Router();

trainController.post("/", createTrain);
trainController.get("/", getAllTrains);
trainController.get("/filter", filterAvailableTrains);
trainController.get("/:id", getTrainById);
trainController.patch("/:id", updateTrain);
trainController.delete("/:id", deleteTrain);

export default trainController;
