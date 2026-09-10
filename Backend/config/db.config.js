import mongoose from "mongoose";

let isConnected = false;

const DBConnect = async () => {
  try {
    if (isConnected || mongoose.connection.readyState === 1) {
      return;
    }

    if (!process.env.MONGO_URL) {
      console.error("❌ MONGO_URL environment variable is missing!");
      return;
    }

    const options = {
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    await mongoose.connect(process.env.MONGO_URL, options);
    isConnected = true;
    console.log("✅ MongoDB Connected with optimized connection pool");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
  }
};

export default DBConnect;
