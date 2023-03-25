import express from "express";
import {
  getParties,
  addAllParties,
  searchParty,
} from "../controllers/party.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getParties);
router.get("/search", searchParty);
router.post("/bulk", upload.single("bulkParties"), addAllParties);
// router.post();

export default router;
