require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");
const User = require("../models/User");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createHRUser() {
  try {
    const name = (await ask("Enter HR name: ")).trim();
    const email = (await ask("Enter HR email: ")).trim().toLowerCase();
    const password = await ask("Create HR password (minimum 8 characters): ");

    if (!name || !email || password.length < 8) {
      throw new Error("Name, valid email, and a password of at least 8 characters are required.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Please enter a valid email address.");
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from your .env file.");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from your .env file.");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error(
        "This email already exists. Choose another email or use an existing account."
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const hrUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "HR",
    });

    console.log("\nHR account created successfully!");
    console.log(`Name: ${hrUser.name}`);
    console.log(`Email: ${hrUser.email}`);
    console.log(`Role: ${hrUser.role}`);
    console.log("Password: The password you entered is saved securely as a hash.");
  } catch (error) {
    console.error("\nCould not create HR account:", error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    await mongoose.disconnect().catch(() => {});
  }
}

createHRUser();