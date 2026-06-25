import { Queue } from "bullmq";
import { Redis } from "ioredis";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const queueConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const mailQueue = new Queue("mailQueue", {
  connection: queueConnection,
});

export default mailQueue;
