import { config } from "dotenv";

config();

process.env.APP_ENV = "test";
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgresql://optica:optica@localhost:5432/optica_test?schema=public";
process.env.BETTER_AUTH_SECRET =
  process.env.BETTER_AUTH_SECRET ?? "test-better-auth-secret-min-32-chars!!";
process.env.APP_URL = process.env.APP_URL ?? "http://localhost:3000";
process.env.TZ = "America/Costa_Rica";
