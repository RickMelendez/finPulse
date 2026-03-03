import db from '../infrastructure/config/database';

async function runMigrations() {
  const [batch, log] = await db.migrate.latest();
  if (log.length === 0) {
    console.log('Database already up to date.');
  } else {
    console.log(`Migrations complete. Batch ${batch}: ${log.join(', ')}`);
  }
  await db.destroy();
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
