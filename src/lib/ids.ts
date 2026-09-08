import { v7 as uuidv7 } from "uuid";

/** Política de IDs del dominio: UUIDv7, sin mezclar CUID ni seriales. */
export function createId(): string {
  return uuidv7();
}
