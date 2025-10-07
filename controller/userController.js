import express from "express";
import {
  userRegistration,
  userLogin,
  getAllUsers,
  updateUser,
  deleteUser,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
} from "../service/userService.js";

const userController = express.Router();

userController.post("/register", userRegistration);
userController.post("/login", userLogin);
userController.post("/forgot-password", requestPasswordReset);
userController.post("/verify-reset-code", verifyResetCode);
userController.post("/reset-password", resetPassword);
userController.get("/all", getAllUsers);
userController.delete("/delete/:id", deleteUser);
userController.patch("/update/:id", updateUser);

export default userController;
