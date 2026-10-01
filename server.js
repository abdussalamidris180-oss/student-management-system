
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://abdussalamidris180_db_user:<db_password>@cluster0.mksgtaz.mongodb.net/elixirmedics?retryWrites=true&w=majority";

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

// --- API ROUTES ---

// 1. Register Route (Mambobi)
app.post("/api/register", async (req, res) => {
  try {
    const { fullName, email, department, year, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Wannan Email din an riga an yi amfani da shi." });
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
    res.status(201).json({ message: "An yi rajista cikin nasara!" });
  } catch (error) {
    res.status(500).json({ message: "Kuskure ya faru wajen yin rajista.", error: error.message });
  }
});

// 2. Create Admin Route
app.post("/api/admin/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Wannan Admin Email din yana nan ma." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({
      email,
      password: hashedPassword,
      role: "admin"
    });

    await newAdmin.save();
    res.status(201).json({ message: "An kirkiri Admin account cikin nasara!" });
  } catch (error) {
    res.status(500).json({ message: "Kuskure wajen kirkirar Admin.", error: error.message });
  }
});

// 3. Login Route (Admin & Member)
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Babu mai wannan Email din." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password dinka ba daidai ba ne." });
    }

    res.json({
      message: "An shiga cikin nasara!",
      user: { id: user._id, email: user.email, role: user.role, fullName: user.fullName }
    });
  } catch (error) {
    res.status(500).json({ message: "Kuskure ya faru wajen Login.", error: error.message });
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
