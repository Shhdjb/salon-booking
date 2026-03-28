import { z } from "zod";

export function isValidEmail(input: string): boolean {
  const t = input.trim();
  if (!t) return false;
  return z.string().email().safeParse(t).success;
}
