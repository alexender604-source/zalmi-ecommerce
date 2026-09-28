import { existsSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
if (!existsSync('.env')) {
  const password=randomBytes(24).toString('hex');
  writeFileSync('.env', `DATABASE_URL="postgresql://zarshal:${password}@127.0.0.1:54329/zarshal?schema=public"\nAPP_URL="http://localhost:3000"\nADMIN_EMAIL="admin@zarshal.local"\nADMIN_PASSWORD="${randomBytes(18).toString('base64url')}"\nUPLOAD_DRIVER="local"\n`, {mode:0o600});
  console.log('Created .env with random development credentials. Read ADMIN_EMAIL / ADMIN_PASSWORD there.');
} else console.log('.env already exists; preserved its configuration.');
