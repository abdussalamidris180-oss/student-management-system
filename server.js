
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config();

const app = express();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("JWT_SECRET is not set.");
  process.exit(1);
}

const ADMIN_SETUP_KEY = process.env.ADMIN_SETUP_KEY;

if (!ADMIN_SETUP_KEY) {
  console.error("ADMIN_SETUP_KEY is not set.");
  process.exit(1);
}
app.use(express.json());
app.use(express.static(__dirname));

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is not set.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Database Connected Successfully!"))
  .catch((err) => console.error("Database connection error:", err));

// User Schema & Model
const userSchema = new mongoose.Schema({
  fullName: { type: String },
  email: { type: String, required: true, unique: true },
  department: { type: String },
  year: { type: String },
  password: { type: String, required: true },
  role: { type: String, default: "member" }, // "member" or "admin"
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

function createToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
}
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required."
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token."
    });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required."
    });
  }

  next();
}
// --- API ROUTES ---

// 1. Register Route (Members)
app.post("/api/register", async (req, res) => {
  try {
    const { fullName, email, department, year, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "This email is already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      email,
      department,
      year,
      password: hashedPassword,
      role: "member"
    });

    await newUser.save();


const token = createToken(newUser);

res.status(201).json({
  message: "Registration successful!",
  token,
  user: {
    id: newUser._id,
    email: newUser.email,
    role: newUser.role,
    fullName: newUser.fullName,
    department: newUser.department,
    year: newUser.year
  }
});
});

// 2. Create Admin Route
app.post("/api/admin/register", async (req, res) => {
  try {
    const setupKey = req.headers["x-admin-setup-key"];

    if (!setupKey || setupKey !== ADMIN_SETUP_KEY) {
      return res.status(403).json({
        message: "Admin setup authorization required."
      });
    }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "This Admin email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({
      email,
      password: hashedPassword,
      role: "admin"
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin account created successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error creating Admin account.", error: error.message });
  }
});

// 3. Login Route (Admin & Member)
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User with this email does not exist." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password." });
    }

    const token = createToken(user);

res.json({
  message: "Login successful!",
  token,
  user: {
    id: user._id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
    department: user.department,
    year: user.year
  }
});
  } catch (error) {
    res.status(500).json({ message: "An error occurred during login.", error: error.message });
  }
});

// Front-end Route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const port = process.env.PORT || 3000;
const host = "0.0.0.0";

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
