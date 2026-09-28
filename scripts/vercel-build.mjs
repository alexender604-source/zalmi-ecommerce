import { spawnSync } from 'node:child_process';

function run(script, env = process.env) {
  const command = process.platform === 'win32' ? process.env.ComSpec || 'cmd.exe' : 'npm';
  const args = process.platform === 'win32' ? ['/d', '/s', '/c', `npm run ${script}`] : ['run', script];
  const result = spawnSync(command, args, { stdio: 'inherit', env });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function hasHostedDatabase() {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) return false;
  try {
    const url = new URL(value);
    return ['postgres:', 'postgresql:'].includes(url.protocol)
      && Boolean(url.hostname && url.pathname.length > 1)
      && !['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  } catch {
    return false;
  }
}

if (hasHostedDatabase()) {
  console.log('Hosted PostgreSQL detected. Applying migrations and seeding required store data.');
  const migrationUrl = process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL;
  const migrationEnv = { ...process.env, DATABASE_URL: migrationUrl };
  run('db:migrate', migrationEnv);
  run('db:seed', migrationEnv);
} else {
  console.warn('No hosted PostgreSQL database detected. Building the temporary availability page.');
}

run('build');
