import { PgBoss } from "pg-boss";
import { HEALTH_CHECK_QUEUE } from "@/server/jobs/client";
import { logger } from "@/server/logging/logger";

export async function startJobWorker(): Promise<PgBoss> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL no está definida");
  }

  const boss = new PgBoss(databaseUrl);
  boss.on("error", (error) => {
    logger.error("pg-boss worker error", {
      module: "jobs",
      message: error instanceof Error ? error.message : "unknown",
    });
  });

  await boss.start();
  await boss.createQueue(HEALTH_CHECK_QUEUE);

  await boss.work(HEALTH_CHECK_QUEUE, async ([job]) => {
    if (!job) {
      return;
    }
    logger.info("job.processed", {
      module: "jobs",
      action: HEALTH_CHECK_QUEUE,
      jobId: job.id,
      data: job.data,
    });
  });

  logger.info("worker.started", { module: "jobs", action: "start" });
  return boss;
}
