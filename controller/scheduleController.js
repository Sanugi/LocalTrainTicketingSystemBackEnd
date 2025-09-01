import express from "express";

import {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  getAllScheduleByTrainId
} from "../service/scheduleService.js";

const scheduleController = express.Router();

scheduleController.post("/", createSchedule);
scheduleController.get("/", getAllSchedules);
scheduleController.get("/:id", getScheduleById);
scheduleController.get("/train/:id", getAllScheduleByTrainId);
scheduleController.patch("/:id", updateSchedule);
scheduleController.delete("/:id", deleteSchedule);

export default scheduleController;
