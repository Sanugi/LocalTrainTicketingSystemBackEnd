import express from "express";

import {
  createBooking,
  getBooking,
  updateBooking,
  deleteBooking,
  getAllBookings,
  getAllBookingsForUser,
} from '../service/bookingService.js'

const bookingController = express.Router();

bookingController.post('/bookings', createBooking);
bookingController.get('/bookings', getAllBookings);
bookingController.get('/bookings/user/:id', getAllBookingsForUser);
bookingController.get('/bookings/:id', getBooking);
bookingController.patch('/bookings/:id', updateBooking);
bookingController.delete('/bookings/:id', deleteBooking);


export default bookingController;
