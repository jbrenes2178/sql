import { hash, verify } from "@node-rs/argon2";

const ARGON2_OPTIONS = {
  algorithm: 2, // Argon2id
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export async function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return verify(passwordHash, password, ARGON2_OPTIONS);
}

export async function verifyBetterAuthPassword(data: {
  hash: string;
  password: string;
}): Promise<boolean> {
  return verifyPassword(data.password, data.hash);
}
