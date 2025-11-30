import express from "express";
import connectDB from "./config/db";
import cors from "cors"
import productRoutes from "./routes/productRoutes";
import dotenv from "dotenv"
const app = express();
app.use(express.json());
app.use(cors())
dotenv.config()
connectDB();
app.use("/api/products", productRoutes);


app.listen(5000, () => console.log("Server running on port 5000"));