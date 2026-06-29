import dotenv from "dotenv";
import fs from "fs";
const envPath = fs.existsSync("./.env") ? "./.env" : "../.env";
dotenv.config({ path: envPath });

import connectDB from "./db/db.js"
import {httpServer} from "./server.js";
import { initializeSocket } from "./sockets/index.js";
import { redis } from "./redis/config.js";
import { seedDefaultCategories } from "./services/category.service.js";
import { migrateProductSlugs } from "./services/product.service.js";
// import { generateInterviewReport } from "./services/ai.service.js";

connectDB().then(async () => {
  initializeSocket();
  await seedDefaultCategories();
  await migrateProductSlugs();
  httpServer.listen(3000, async () => {
    console.log("Server is running on port 3000");
    // console.log("Response = ", await generateInterviewReport());
  });
});
// Trigger nodemon restart
