import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("im here mongo connect...")
    const defaultUri = "mongodb://127.0.0.1:27017";
    const uri = (process.env.MONGO_URI as string) || defaultUri;

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
