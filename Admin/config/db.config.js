import mongoose from "mongoose";

const DBConnect = async () => {
  try {
    const options = {
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is not defined");
    }

    if (mongoose.connection.readyState === 1) {
      console.log(" MongoDB already connected");
      return;
    }

    await mongoose.connect(process.env.MONGO_URL, options);

    console.log("Admin MongoDB Connected");
  } catch (error) {
    console.error(" MongoDB Connection Error:", error.message);

    throw error;
  }
};

export default DBConnect;
