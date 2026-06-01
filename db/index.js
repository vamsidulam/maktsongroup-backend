const mongoose = require("mongoose");

async function connectDb() {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      dbName: process.env.DATABASE_NAME,
    });
    console.log("✓ Connected to MongoDB");
  } catch (err) {
    console.error("✗ Failed to connect to MongoDB:", err.message);
    throw err;
  }
}

module.exports = { connectDb };
