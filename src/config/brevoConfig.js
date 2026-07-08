import { BrevoClient } from "@getbrevo/brevo";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env variables are loaded (useful for script execution / seeding)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

export { brevo };
export default brevo;
