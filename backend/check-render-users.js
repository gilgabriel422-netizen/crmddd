console.log('SCRIPT START');

const { Pool } = require('pg');

console.log('DATABASE_URL exists?', !!process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
});

(async () => {
  try {
    console.log('Connecting...');
    const now = await pool.query('SELECT NOW() as now');
    console.log('Connected:', now.rows[0]);

    console.log('Querying usuarios...');
    const r = await pool.query('SELECT id, email, rol FROM usuarios ORDER BY id DESC LIMIT 50');
    console.table(r.rows);

    await pool.end();
    console.log('DONE');
    process.exit(0);
  } catch (e) {
    console.error('ERR', e.message);
    process.exit(1);
  }
})();
