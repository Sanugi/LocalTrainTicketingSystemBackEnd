import express from "express";
import {
  userRegistration,
  userLogin,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../service/userService.js";

const userController = express.Router();

userController.post("/register", userRegistration);
userController.post("/login", userLogin);
userController.get("/all", getAllUsers);
userController.delete("/delete/:id", deleteUser);
userController.patch("/update/:id", updateUser);

export default userController;
