require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "StaffSync API is running.",
  });
});

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`StaffSync server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed because the database is unavailable.");
    process.exit(1);
  }
};

startServer();