import express from "express";
// import {
//   getItems,
//   addAllItems,
//   searchItem,
// } from "../controllers/items.controller.js";
import {
  createUser,
  loginUser,
  registerUser,
  updateUser,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/authMiddleware.js";
// import multer from "multer";

const router = express.Router();
// const upload = multer({ dest: "uploads/" });

// router.get("/", getItems);
router.post("/", createUser);
router.put("/", protect, updateUser);
router.post("/login", loginUser);
router.post("/register", registerUser);
// router.post();

export default router;
