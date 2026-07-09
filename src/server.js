import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import dns from "node:dns";

// Prioritize IPv4 DNS resolution to prevent ENETUNREACH IPv6 errors when connecting to services like smtp.gmail.com
dns.setDefaultResultOrder("ipv4first");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import app from "./app.js";
import "./workers/mailWorker.js";
import { scheduleDailyAbsentJob } from "./services/attendance/scheduler.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
  // Start the daily absent tracking scheduler
  scheduleDailyAbsentJob();
});
