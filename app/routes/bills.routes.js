import express from "express";
import {
  addAllBills,
  getAllPartyBills,
} from "../controllers/bills.controller.js";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// router.get("/", protect, getItems);
// router.delete("/", deleteItems);
router.get("/:partyCode", protect, getAllPartyBills);
router.post("/bulk", upload.single("bulkBills"), addAllBills);
// router.get("/:itemId", checkItemQuantity);
// router.put("/", updateItemQuantity);
// router.post();

export default router;
