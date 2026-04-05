import express from "express";
import { adminLogin, getAllStudents } from "../controllers/adminController.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/students", getAllStudents);

export default router;
