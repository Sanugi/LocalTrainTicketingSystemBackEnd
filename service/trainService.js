import Train from "../modals/train.js";
import Schedule from "../modals/schedule.js";
import { isAdmin } from "../service/userService.js";

export const createTrain = async (req, res) => {
  if (!isAdmin(req.user)) {
    return res.status(403).json({
      success: false,
      message:
        "Access denied : You do not have permission to perform this action",
    });
  }
  const {
    trainNumber,
    trainName,
    fromStation,
    toStation,
    seatCount,
    ticketPrice,
  } = req.body;

  try {
    const newTrain = new Train({
      trainNumber,
      trainName,
      fromStation,
      toStation,
      seatCount,
      ticketPrice,
    });
    await newTrain.save();
    return res.status(201).json({
      success: true,
      message: "Train created successfully",
      data: newTrain,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllTrains = async (req, res) => {
  try {
    const trains = await Train.find();
    return res.status(200).json({
      success: true,
      data: trains,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getTrainById = async (req, res) => {
  const { id } = req.params;

  try {
    const train = await Train.findById({ _id: id });
    if (!train) {
      return res.status(404).json({
        success: false,
        message: "Train not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: train,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateTrain = async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;
  if (!isAdmin(req.user)) {
    return res.status(403).json({
      success: false,
      message:
        "Access denied : You do not have permission to perform this action",
    });
  }

  try {
    const train = await Train.findByIdAndUpdate(
      { _id: id },
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    if (!train) {
      return res.status(404).json({
        success: false,
        message: "Train not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: train,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteTrain = async (req, res) => {
  const { id } = req.params;
  if (!isAdmin(req.user)) {
    return res.status(403).json({
      success: false,
      message:
        "Access denied : You do not have permission to perform this action",
    });
  }

  try {
    const train = await Train.findByIdAndDelete({ _id: id });
    if (!train) {
      return res.status(404).json({
        success: false,
        message: "Train not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Train deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const filterAvailableTrains = async (req, res) => {
  const { 
    fromStation, 
    toStation, 
    date
  } = req.query;

  try {
    if (!fromStation || !toStation || !date) {
      return res.status(400).json({
        success: false,
        message: "fromStation, toStation, and date are required",
      });
    }

    const searchDate = new Date(date);
    if (isNaN(searchDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Please use YYYY-MM-DD format",
      });
    }

    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    const trains = await Train.find({
      fromStation: { $regex: fromStation, $options: 'i' },
      toStation: { $regex: toStation, $options: 'i' }
    });

    if (trains.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No trains found for the specified route",
        data: []
      });
    }
    const trainIds = trains.map(train => train._id);

    const schedules = await Schedule.find({
      trainId: { $in: trainIds },
      departureDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      availableSeats: { $gt: 0 } 
    }).populate('trainId');

    const availableTrains = schedules.map(schedule => ({
      trainId: schedule.trainId._id,
      trainNumber: schedule.trainId.trainNumber,
      trainName: schedule.trainId.trainName,
      fromStation: schedule.trainId.fromStation,
      toStation: schedule.trainId.toStation,
      seatCount: schedule.trainId.seatCount,
      ticketPrice: schedule.trainId.ticketPrice,
      scheduleId: schedule._id,
      departureDate: schedule.departureDate,
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      availableSeats: schedule.availableSeats
    }));

    return res.status(200).json({
      success: true,
      message: `Found ${availableTrains.length} available trains for the specified criteria`,
      data: availableTrains
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
