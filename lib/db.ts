import { PrismaClient } from "@prisma/client";

const globalDb = globalThis as unknown as { prisma?: PrismaClient };

function runtimeDatabaseUrl() {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.hostname.endsWith('.pooler.supabase.com') && url.port === '6543') {
      url.searchParams.set('pgbouncer', 'true');
      url.searchParams.set('connection_limit', '5');
      url.searchParams.set('pool_timeout', '30');
    }
    return url.toString();
  } catch {
    return value;
  }
}

const datasourceUrl = runtimeDatabaseUrl();
export const db = globalDb.prisma ?? new PrismaClient(datasourceUrl ? { datasourceUrl } : undefined);
if (process.env.NODE_ENV !== "production") globalDb.prisma = db;
