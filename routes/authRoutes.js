import express from "express";
import {
  // allUsers,
  // checkLogin,
  login,
  logout,
  register,
  sendverifyOtp,
  verifyEmail,
} from "../controllers/authController.js";
import { userAuth } from "../middleware/userAuth.js";

export const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-verify-otp", userAuth, sendverifyOtp);
authRouter.post("/verify-account", userAuth, verifyEmail);

// authRouter.get("/all-users", userAuth, allUsers);
// authRouter.get("/check-login", userAuth, checkLogin);
