import cookieParser from 'cookie-parser';
import express from 'express';
import { createServer } from "http"
import { Server } from "socket.io"
import cors from 'cors';
import dotenv from "dotenv";

dotenv.config({ path: "./.env" })


const app = express();  // Create an Express application

const httpServer = createServer(app)   // Create an HTTP server

// Initialize Socket.IO with the server


app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
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

// const PORT = process.env.PORT || 3000;
// httpServer.listen(PORT, () => {
//     console.log(`Server listening on port ${PORT}`);
// });

export { httpServer, app };

