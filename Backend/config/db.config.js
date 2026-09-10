import mongoose from "mongoose";

let isConnected = false;

const DBConnect = async () => {
  try {
    if (isConnected || mongoose.connection.readyState === 1) {
      return;
    }

    if (!process.env.MONGO_URL) {

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

  }
};

export default DBConnect;
