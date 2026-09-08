import "dotenv/config";
import { logger } from "../src/server/logging/logger";
import { startJobWorker } from "../src/server/jobs/worker";

async function main(): Promise<void> {
  const boss = await startJobWorker();

  const shutdown = async (signal: string) => {
    logger.info("worker.shutdown", { module: "jobs", action: signal });
    await boss.stop({ graceful: true, timeout: 10_000 });
    process.exit(0);
  };

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });
}

main().catch((error: unknown) => {
  logger.error("worker.fatal", {
    module: "jobs",
    message: error instanceof Error ? error.message : "unknown",
  });
  process.exit(1);
});
