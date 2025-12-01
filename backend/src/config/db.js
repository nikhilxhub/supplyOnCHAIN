"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        console.log("im here mongo connect...");
        const defaultUri = "mongodb://127.0.0.1:27017";
        const uri = process.env.MONGO_URI || defaultUri;
        const conn = await mongoose_1.default.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};
exports.default = connectDB;
