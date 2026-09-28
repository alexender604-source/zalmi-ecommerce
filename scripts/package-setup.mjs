import { readFileSync, writeFileSync } from 'node:fs';
const p=JSON.parse(readFileSync('package.json','utf8'));
Object.assign(p.scripts,{'db:local':'node scripts/local-db.mjs','db:setup':'node scripts/setup-local.mjs','db:generate':'prisma generate','db:migrate':'prisma migrate deploy','db:seed':'tsx prisma/seed.ts','typecheck':'tsc --noEmit','test':'tsx --test tests/*.test.ts','test:e2e':'playwright test'});
p.prisma={seed:'tsx prisma/seed.ts'};
writeFileSync('package.json',JSON.stringify(p,null,2)+'\n');
