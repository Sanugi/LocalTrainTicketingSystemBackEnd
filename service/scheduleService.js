import Schedule from "../modals/schedule.js";
import { isAdmin } from "../service/userService.js";

export const createSchedule = async (req, res) => {
  // if (!isAdmin(req)) {
  //   return res.status(403).json({
  //     success: false,
  //     message:
  //       "Access denied : You do not have permission to perform this action",
  //   });
  // }
  const { 
    trainId, 
    departureDate, 
    departureTime, 
    arrivalTime,
    availableSeats,
    date
  } = req.body;

  try {
    const newSchedule = new Schedule({
      trainId,
      departureDate,
      departureTime,
      arrivalTime,
      availableSeats,
      date
    });
    await newSchedule.save();
    return res.status(201).json({
      success: true,
      message: "Schedule created successfully",
      data: newSchedule,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllSchedules = async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({
      success: false,
      message:
        "Access denied : You do not have permission to perform this action",
    });
  }

  try {
    const schedules = await Schedule.find().populate("trainId");
    return res.status(200).json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getScheduleById = async (req, res) => {
  const { id } = req.params;

  try {
    const schedule = await Schedule.findById({ _id: id }).populate("trainId");
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateSchedule = async (req, res) => {
  const { id } = req.params;

  if (!isAdmin(req)) {
    return res.status(403).json({
      success: false,
      message:
        "Access denied : You do not have permission to perform this action",
    });
  }
  const updateFields = req.body;

  try {
    const updatedSchedule = await Schedule.findByIdAndUpdate(
      { _id: id },
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    if (!updatedSchedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Schedule updated successfully",
      data: updatedSchedule,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteSchedule = async (req, res) => {
  const { id } = req.params;

  if (!isAdmin(req)) {
    return res.status(403).json({
      success: false,
      message:
        "Access denied : You do not have permission to perform this action",
    });
  }

  try {
    const deletedSchedule = await Schedule.findByIdAndDelete({ _id: id });
    if (!deletedSchedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Schedule deleted successfully",
      data: deletedSchedule,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllScheduleByTrainId = async (req, res) => {
  const { id } = req.params;

  try {
    const schedules = await Schedule.find({ trainId: id }).populate("trainId");
    return res.status(200).json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
