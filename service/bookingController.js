import Booking from "../modals/booking.js";
import Schedule from "../modals/schedule.js";

export const createBooking = async (req, res) => {
  const { userId, scheduleId, seatsBooked, totalAmount } = req.body;

  try {
    const newBooking = new Booking({
      userId,
      scheduleId,
      seatsBooked,
      totalAmount,
    });
    const schedule = await Schedule.findById(scheduleId);
    if (seatsBooked > schedule.availableSeats) {
      return res.status(400).json({
        success: false,
        message: "Not enough available seats",
      });
    }
    await newBooking.save();
    schedule.availableSeats -= seatsBooked;
    await schedule.save();
    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: newBooking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllBookings = async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({
      success: false,
      message:
        "Access denied : You do not have permission to perform this action",
    });
  }
  try {
    const bookings = await Booking.find().populate("userId scheduleId");
    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getBookingById = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await Booking.findById(id).populate("userId scheduleId");
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllBookingsForUser = async (req, res) => {
  const { id } = req.params;

  try {
    const bookings = await Booking.find({ userId: id }).populate(
      "userId scheduleId"
    );
    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateBooking = async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      { _id: id },
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    if (!updatedBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: updatedBooking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBooking = await Booking.findByIdAndDelete({ _id: id });
    if (!deletedBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
      data: deletedBooking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
