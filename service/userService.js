import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../modals/User.js";
import authConstants from "../constant/auth.js";

const { USER, ADMIN, TOKEN_VALID_TIME } = authConstants;

const JWT_SECRET = process.env.JWT_SECRET;

export const userRegistration = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email",
        error: "Invalid email",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
        error: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        userName: user.username,
      },
      JWT_SECRET,
      {
        expiresIn: TOKEN_VALID_TIME,
      }
    );

    return res.status(200).json({
      accessToken: token,
      userDetails: {
        userId: user._id,
        role: user.role,
        userName: user.username,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const isAdmin = (req) => {
  if (req.user == null) {
    return false;
  }
  if (req.user.role != ADMIN) {
    return false;
  }
  return true;
};

export const isUser = (req) => {
  if (req.user == null) {
    return false;
  }
  if (req.user.role != USER) {
    return false;
  }
  return true;
};

export const getUserId = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById({ _id: id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin access required",
      error: "You do not have permission to access this resource",
    });
  }
  try {
    const users = await User.find();
    return res.status(200).json({
      success: true,
      message: "User details retrieved successfully.",
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!isAdmin(req)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin access required",
      error: "You do not have permission to access this resource",
    });
  }
  try {
    const user = await User.findByIdAndDelete({ _id: id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, role } = req.body;

  if (!isAdmin(req)) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin access required",
      error: "You do not have permission to access this resource",
    });
  }

  try {
    const user = await User.findByIdAndUpdate(
      { _id: id },
      { username, email, role },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
