import jwt from "jsonwebtoken";
import authConstants from "../constant/auth.js";
import dotenv from "dotenv";

dotenv.config();

const { AUTH_HEADER, BEARER_PREFIX, EMPTY_STRING } = authConstants;
const authenticate = (req, res, next) => {
  const value = req.header(AUTH_HEADER);

  if (!value) {
    return next();
  }

  const token = value.replace(BEARER_PREFIX, EMPTY_STRING);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    // if (err || !decoded) {
    //   return res.status(403).json({ message: "Unauthorized" });
    // }
    req.user = decoded;
    next();
  });
};

export default authenticate;
