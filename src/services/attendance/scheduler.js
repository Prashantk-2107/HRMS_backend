import { markAbsentForYesterdayService } from "./markAbsentForYesterday.js";

/**
 * Schedules the automatic absent check job to execute daily at midnight local time.
 * Also runs once immediately at start-up to catch any missed updates if the server was offline.
 */
function scheduleDailyAbsentJob() {
  // 1. Run once immediately at startup
  console.log("[Scheduler] Running initial absent job startup sync...");
  runJob();

  // 2. Schedule to run daily at midnight
  const setupNextRun = () => {
    const now = new Date();
    const nextMidnight = new Date(now);
    
    // Set to 12:00 AM of the next day
    nextMidnight.setHours(24, 0, 0, 0);
    
    const msUntilMidnight = nextMidnight - now;
    
    console.log(`[Scheduler] Daily absent job scheduled. Next run in ${Math.round(msUntilMidnight / 1000 / 60)} minutes.`);
    
    setTimeout(() => {
      runJob();
      // After midnight run, set up the next daily scheduler
      setupNextRun();
    }, msUntilMidnight);
  };

  setupNextRun();
}

async function runJob() {
  try {
    console.log("[Scheduler] Initiating automatic absent marker job...");
    await markAbsentForYesterdayService();
    console.log("[Scheduler] Automatic absent marker job completed.");
  } catch (error) {
    console.error("[Scheduler] Error executing automatic absent marker job:", error);
  }
}

export { scheduleDailyAbsentJob };
