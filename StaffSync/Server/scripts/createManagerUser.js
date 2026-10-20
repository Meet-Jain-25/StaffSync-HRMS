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

async function createManagerUser() {
  try {
    const name = (await ask("Enter Manager name: ")).trim();
    const email = (await ask("Enter Manager email: "))
      .trim()
      .toLowerCase();
    const password = await ask(
      "Create Manager password (minimum 8 characters): "
    );

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
      throw new Error(
        "Enter a name, valid email, and password of at least 8 characters."
      );
    }

    if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
      throw new Error(
        "MONGODB_URI or JWT_SECRET is missing from the Server .env file."
      );
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error(
        "This email already exists. Choose another email."
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const manager = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "Manager",
    });

    console.log("\nManager account created successfully!");
    console.log(`Name: ${manager.name}`);
    console.log(`Email: ${manager.email}`);
    console.log(`Role: ${manager.role}`);
    console.log("Password: Saved securely as a hash.");
  } catch (error) {
    console.error("\nCould not create Manager account:", error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    await mongoose.disconnect().catch(() => {});
  }
}

createManagerUser();