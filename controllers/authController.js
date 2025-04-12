import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { sendEmail, transporter } from "../config/nodemailer.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "missing details" });
    }
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: "User Already Exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("🔹 Sending email to:");
    console.log("Sending📩📩");

    //sending email
    sendEmail(
      email,
      "Hello to the page",
      `welcome to the page,your registered email id is : ${email}`,
      `<h2 style="color: blue;">Hello,${name} welcome! 🎉</h2><p>Thank you for signing up.</p>`
    );
    return res.json({
      success: true,
      message: "User registered & email sent ",
    });
  } catch (error) {
    console.error("❌ Error Details:", error);
    res.json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Invalid email or password" });
  }
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "invalid email" });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ success: true, message: "Logged in successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.json({
        success: false,
        message: "User doesn't Exist or User is not Logged in",
      });
    }
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: "Logged Out" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//send verification otp to users email
export const sendverifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpiryAt = Date.now() + 24 * 60 * 60 * 1000;

    const mailOption = {
      from: `"srinjoy" <${process.env.SENDER_EMAIL}>`, //It Must be a verified sender
      to: user.email,
      subject: "Account verification OTP",
      text: `Your verification OTP is : ${otp}, Verify your account with this`,
    };
    await transporter.sendMail(mailOption);

    res.json({
      success: true,
      message: " verification otp sent to your email",
    });

    await user.save();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "user Not Found" });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpiryAt < Date.now()) {
      return res.json({ success: false, message: "Otp Expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpiryAt = 0;
    await user.save();

    return res.json({ success: true, message: "email verified successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// export const allUsers = async (req, res) => {
//   try {
//     const currentUserId = req.user.id;
//     console.log("from token ", req.user);

//     // Todo-> send all users data except the loggenin user
//     const users = await userModel.find(
//       { _id: { $ne: currentUserId } },
//       { name: 1, email: 1, _id: 0 }
//     );
//     res.status(200).json({ success: true, users });
//   } catch (error) {
//     return res.json({ success: false, message: error.message });
//   }
// };

// export const checkLogin = async (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "already logged in",
//     user: req.user,
//   });
// ;
// }
