import cookieParser from 'cookie-parser';
import express from 'express';
import { createServer } from "http"
import { Server } from "socket.io"
import cors from 'cors';
import dotenv from "dotenv";

dotenv.config({ path: "./.env" })


const app = express();  // Create an Express application
app.set("trust proxy", 1); // Trust first proxy (Render, Vercel, etc.)

const httpServer = createServer(app)   // Create an HTTP server

// Initialize Socket.IO with the server

const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000"
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (
            allowedOrigins.includes(origin) ||
            origin.startsWith("http://localhost:") ||
            origin.startsWith("http://127.0.0.1:")
        ) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
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

app.use("/api/groups", groupRoutes)

app.use("/api/users", userRouter)
app.use("/api/messages", messageRouter)
app.use("/api/chats", chatRouter)
app.use("/api/ping", pingRouter)
app.use("/api/requests", requestRouter)
app.use("/api/notifications", notificationRouter)

import productRouter from "./routes/product.route.js"
import cartRouter from "./routes/cart.route.js"
import orderRouter from "./routes/order.route.js"
import adminRouter from "./routes/admin.route.js"
import categoryRouter from "./routes/category.route.js"

app.use("/api/products", productRouter)
app.use("/api/cart", cartRouter)
app.use("/api/orders", orderRouter)
app.use("/api/admin", adminRouter)
app.use("/api/categories", categoryRouter)

// const PORT = process.env.PORT || 3000;
// httpServer.listen(PORT, () => {
//     console.log(`Server listening on port ${PORT}`);
// });

export { httpServer, app };

