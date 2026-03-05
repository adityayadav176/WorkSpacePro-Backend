const mongoose = require("mongoose");

const connectToMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to Mongo successfully");
  } catch (error) {
    console.error("❌ Mongo connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectToMongo;