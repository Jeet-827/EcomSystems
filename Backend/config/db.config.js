import mongoose from "mongoose";

const DBConnect = async () => {
  try {
    const options = {
      maxPoolSize: 50,
      minPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    await mongoose.connect(process.env.MONGO_URL, options);
    console.log("✅ MongoDB Connected with optimized connection pool");
  } catch (error) {

    process.exit(1);
  }
};

export default DBConnect;
