import express from "express";
import {
  getParties,
  addAllParties,
  searchParty,
  deleteParties,
} from "../controllers/party.controller.js";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", protect, getParties);
router.delete("/", protect, deleteParties);
router.get("/search", protect, searchParty);
router.post("/bulk", upload.single("bulkParties"), addAllParties);
// router.post();

export default router;
