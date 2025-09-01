import mongoose from "mongoose";

const { Schema } = mongoose;

const scheduleSchema = new Schema(
  {
    trainId: {
      type: Schema.Types.ObjectId,
      ref: "Train",
      required: true,
    },
    departureDate: {
      type: Date,
      required: true,
    },
    departureTime: {
      type: String,
      required: true,
    },
    arrivalTime: {
      type: String,
      required: true,
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Schedule = mongoose.model("Schedule", scheduleSchema);
export default Schedule;
