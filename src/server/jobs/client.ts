import { PgBoss } from "pg-boss";
import { logger } from "@/server/logging/logger";

const HEALTH_CHECK_QUEUE = "system.health-check";

let enqueueClient: PgBoss | undefined;
let enqueueClientPromise: Promise<PgBoss> | undefined;

async function getEnqueueClient(): Promise<PgBoss> {
  if (enqueueClient) {
    return enqueueClient;
  }
  if (!enqueueClientPromise) {
    enqueueClientPromise = (async () => {
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error("DATABASE_URL no está definida");
      }
      const boss = new PgBoss(databaseUrl);
      boss.on("error", (error) => {
        logger.error("pg-boss enqueue error", {
          module: "jobs",
          message: error instanceof Error ? error.message : "unknown",
        });
      });
      await boss.start();
      await boss.createQueue(HEALTH_CHECK_QUEUE);
      enqueueClient = boss;
      return boss;
    })();
  }
  return enqueueClientPromise;
}

export async function enqueueHealthCheck(payload: { source: string } = { source: "manual" }): Promise<string | null> {
  const boss = await getEnqueueClient();
  const id = await boss.send(HEALTH_CHECK_QUEUE, payload);
  logger.info("job.enqueued", { module: "jobs", action: HEALTH_CHECK_QUEUE, jobId: id });
  return id;
}

export { HEALTH_CHECK_QUEUE };
