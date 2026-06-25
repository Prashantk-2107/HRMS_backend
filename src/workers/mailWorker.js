import { Worker } from "bullmq";
import { Redis } from "ioredis";
import { sendMail } from "../modules/mail/sendMail.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const workerConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const mailWorker = new Worker(
  "mailQueue",
  async (job) => {
    const { to, subject, text } = job.data;
    console.log(`[Queue Worker] Processing email job ${job.id} for: ${to}`);
    
    const mailSent = await sendMail({ to, subject, text });
    
    if (!mailSent) {
      throw new Error(`Failed to send email to ${to}`);
    }
    
    console.log(`[Queue Worker] Email job ${job.id} successfully sent to: ${to}`);
    return true;
  },
  {
    connection: workerConnection,
    // Add standard worker options (e.g. concurrency, limiter, etc. if required, but default concurrency is 1 which is fine for nodemailer)
  }
);

mailWorker.on("completed", (job) => {
  console.log(`[Queue Worker] Job ${job.id} completed.`);
});

mailWorker.on("failed", (job, err) => {
  console.error(`[Queue Worker] Job ${job.id} failed: ${err.message}`);
});

export default mailWorker;
