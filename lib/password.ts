import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(scryptCallback);
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
export async function hashPassword(password: string) { const salt=randomBytes(16).toString("hex"); const hash=await scrypt(password,salt,64) as Buffer; return `scrypt:${salt}:${hash.toString("hex")}`; }
export async function verifyPassword(password: string, encoded: string) { const [,salt,expected]=encoded.split(":"); if(!salt||!expected)return false; const hash=await scrypt(password,salt,64) as Buffer; const expectedBuffer=Buffer.from(expected,"hex");return hash.length===expectedBuffer.length&&timingSafeEqual(hash,expectedBuffer); }
