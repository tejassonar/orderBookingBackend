import express from "express";
import {
  getItems,
  addAllItems,
  searchItem,
  checkItemQuantity,
  deleteItems,
} from "../controllers/items.controller.js";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", protect, getItems);
router.delete("/", deleteItems);
router.get("/search", protect, searchItem);
router.post("/bulk", upload.single("bulkItems"), addAllItems);
router.get("/:itemId", checkItemQuantity);
// router.post();

export default router;
