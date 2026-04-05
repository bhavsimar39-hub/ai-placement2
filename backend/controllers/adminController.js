import Admin from "../models/Admin.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ msg: "No admin found" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ msg: "Password incorrect" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);

    res.json({ token });
};

export const getAllStudents = async (req, res) => {
    const users = await User.find();
    res.json(users);
};
