import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../modals/User.js";
import authConstants from "../constant/auth.js";
import nodemailer from "nodemailer";

const { USER, ADMIN, TOKEN_VALID_TIME } = authConstants;

const JWT_SECRET = process.env.JWT_SECRET;

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();
const RESET_CODE_TTL_MINUTES = 15;

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

// Request password reset: generate code, save to user, send email
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Do not reveal whether email exists — respond with 200 for security
      return res.status(200).json({ success: true, message: "If that email exists, a reset code was sent" });
    }

    const code = generateCode();
    const expires = new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000);

    user.resetCode = code;
    user.resetCodeExpires = expires;
    await user.save();

    // send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password reset code",
      text: `Your password reset code is: ${code}. It expires in ${RESET_CODE_TTL_MINUTES} minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: "If that email exists, a reset code was sent" });
  } catch (error) {
    console.error("Error in requestPasswordReset:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Verify reset code
export const verifyResetCode = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user || !user.resetCode) {
      return res.status(400).json({ success: false, message: "Invalid OTP or email" });
    }
    if (user.resetCode !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    if (!user.resetCodeExpires || user.resetCodeExpires < new Date()) {
      return res.status(400).json({ success: false, message: "Code expired" });
    }

    return res.status(200).json({ success: true, message: "Code verified" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Reset password after verifying code
export const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  if (!email && !password) {
    return res.status(400).json({ success: false, message: "Email and newPassword are required" });
  }
  try {
    const user = await User.findOne({ email });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.resetCode = null;
    user.resetCodeExpires = null;
    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
