import express from "express";
import {
  getItems,
  addAllItems,
  searchItem,
} from "../controllers/items.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getItems);
router.get("/search", searchItem);
router.post("/bulk", upload.single("bulkItems"), addAllItems);
// router.post();

export default router;
