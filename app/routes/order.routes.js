import express from "express";
import {
  getOrders,
  createOrder,
  getOrdersCSV,
  //   addAllParties,
  //   searchParty,
} from "../controllers/order.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getOrders);
router.post("/", createOrder);
router.get("/csv", getOrdersCSV);
// router.get("/search", searchParty);
// router.post("/bulk", upload.single("bulkParties"), addAllParties);
// router.post();

export default router;
