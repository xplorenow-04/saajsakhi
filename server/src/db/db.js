import mongoose from "mongoose";
import mongodb from "mongodb";
import dotenv from "dotenv"
import fs from "fs"

const envPath = fs.existsSync("./.env") ? "./.env" : "../.env";
dotenv.config({ path: envPath });

const connectDB = async ()=>{
    try {
        console.log("Connecting to MongoDB...");
        const connectionInfo = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongoDB connected successfully: ${connectionInfo.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection error: ", error.message);
    }
}

export default connectDB;