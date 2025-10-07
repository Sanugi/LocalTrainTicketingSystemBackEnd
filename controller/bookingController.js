import express from "express";

import {
  createBooking,
  updateBooking,
  deleteBooking,
  getAllBookings,
  getAllBookingsForUser,
} from '../service/bookingService.js'

const bookingController = express.Router();

bookingController.post('/', createBooking);
bookingController.get('/bookings', getAllBookings);
bookingController.get('/bookings/user/:id', getAllBookingsForUser);
bookingController.patch('/bookings/:id', updateBooking);
bookingController.delete('/bookings/:id', deleteBooking);


export default bookingController;
