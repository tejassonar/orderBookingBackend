import express from "express";
import {
  getOrders,
  createOrder,
  getOrdersCSV,
  updateOrderItem,
  deleteOrderItem,
  //   addAllParties,
  //   searchParty,
} from "../controllers/order.controller.js";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", protect, getOrders);
router.put("/:orderItemId", protect, updateOrderItem);
router.delete("/:orderItemId", protect, deleteOrderItem);
router.post("/", createOrder);
router.get("/csv", getOrdersCSV);
// router.get("/search", searchParty);
// router.post("/bulk", upload.single("bulkParties"), addAllParties);
// router.post();

export default router;
