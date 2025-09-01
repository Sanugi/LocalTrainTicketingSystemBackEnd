import mongoose from "mongoose";

const { Schema } = mongoose;

const trainSchema = new Schema({
  trainNumber: { 
    type: String,
    required: true,
    unique: true
  },
  trainName: {
    type: String,
    required: true
  },
  fromStation: {
    type: String,
    required: true
  },
  toStation: {
    type: String,
    required: true
  },
  seatCount: {
    type: Number,
    required: true
  },
  ticketPrice: {
    type: Number,
    required: true
  }
}, { timestamps: true });

const Train = mongoose.model("Train", trainSchema);
export default Train;
