import cookieParser from 'cookie-parser';
import express from 'express';
import { createServer } from "http"
import { Server } from "socket.io"
import cors from 'cors';
import dotenv from "dotenv";
import fs from "fs";

const envPath = fs.existsSync("./.env") ? "./.env" : "../.env";
dotenv.config({ path: envPath });


const app = express();  // Create an Express application

const httpServer = createServer(app)   // Create an HTTP server

// Initialize Socket.IO with the server


app.use(cors({
    origin: [process.env.CLIENT_URL || "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
}))
app.use(express.json({
    limit: "16kb"
}))
app.use(cookieParser())
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))
app.use(express.static("public"))


import userRouter from "./routes/user.route.js"
import messageRouter from "./routes/message.route.js"
import chatRouter from "./routes/chat.route.js"
import pingRouter from "./routes/ping.route.js"
import groupRoutes from "./routes/group.route.js"
import requestRouter from "./routes/request.route.js"
import notificationRouter from "./routes/notification.route.js"
import productRouter from "./routes/product.route.js"
import cartRouter from "./routes/cart.route.js"
import orderRouter from "./routes/order.route.js"
import analyticsRouter from "./routes/analytics.route.js"
import { errorHandler } from "./middlewares/error.middleware.js"

app.use("/api/groups", groupRoutes)

app.use("/api/users", userRouter)
app.use("/api/messages", messageRouter)
app.use("/api/chats", chatRouter)
app.use("/api/ping", pingRouter)
app.use("/api/requests", requestRouter)
app.use("/api/notifications", notificationRouter)
app.use("/api/products", productRouter)
app.use("/api/cart", cartRouter)
app.use("/api/orders", orderRouter)
app.use("/api/analytics", analyticsRouter)

// Centralized error handler
app.use(errorHandler)

// const PORT = process.env.PORT || 3000;
// httpServer.listen(PORT, () => {
//     console.log(`Server listening on port ${PORT}`);
// });

export { httpServer, app };

