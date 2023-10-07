import express from "express";
import {
  createPayment,
  getPaymentsCSV,
  getPayments,
  // getAllPartyBills,
} from "../controllers/payments.controller.js";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", protect, getPayments);
// router.get("/:partyCode", protect, getAllPartyBills);
// router.post("/bulk", upload.single("bulkBills"), addAllBills);
router.post("/", protect, createPayment);
router.get("/csv", getPaymentsCSV);

export default router;
