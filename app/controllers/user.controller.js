import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";

// @desc    Register new user
// @route   POST /api/users
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  // const { name, email, password } = req.body;

  // if (!name || !email || !password) {
  //   res.status(400);
  //   throw new Error("Please add all fields");
  // }

  // Check if user exists
  const user = await User.findOne({ EMAIL: req.body.email });

  if (user.PASSWORD) {
    res.status(400);
    throw new Error("The user is already registered");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  user.PASSWORD = await bcrypt.hash(req.body.password, salt);

  delete req.body.password;

  Object.assign(user, req.body);

  const errors = user.validateSync();
  if (errors) {
    throw new Error(errors);
  }
  user.save();
  // Create user
  // const user = new User({
  //   name,
  //   email,
  //   password: hashedPassword,
  // });

  if (user) {
    res.status(201).json({
      // _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Create a user
// @route   POST /api/users/create
// @access  Public
export const createUser = asyncHandler(async (req, res) => {
  const user = new User(req.body);
  const errors = user.validateSync();
  if (errors) {
    console.log(errors, "errors");
    throw new Error("Invalid user data");
  }
  user.save();
  res.json(user);
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ EMAIL: email });
  console.log(password, user.PASSWORD, "email, password");

  if (user && (await bcrypt.compare(password, user.PASSWORD))) {
    res.json({
      _id: user.id,
      firstName: user.FIRST_NAME,
      lastName: user.LAST_NAME,
      email: user.EMAIL,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
});

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
