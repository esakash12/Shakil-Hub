const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:postgres@localhost/medusa-backend',
});

async function purge() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL!');

    const res = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
    );
    const tables = res.rows.map((r) => r.table_name);
    console.log('All Tables:', tables);

    // Look for customer, auth, and order tables
    const targets = [
      'customer',
      'customer_address',
      'auth_identity',
      'provider_identity',
      'order',
      'order_line_item',
      'cart',
      'cart_line_item',
    ];

    for (const t of targets) {
      if (tables.includes(t)) {
        try {
          const count = await client.query(`SELECT count(*) FROM "${t}"`);
          console.log(`Table ${t} count:`, count.rows[0].count);
          await client.query(`TRUNCATE TABLE "${t}" CASCADE`);
          console.log(`TRUNCATED ${t}`);
        } catch (err) {
          console.warn(`Could not truncate ${t}:`, err.message);
        }
      }
    }

    console.log('PURGE COMPLETE: All customer and auth records purged from database!');
    await client.end();
  } catch (e) {
    console.error('DB Error:', e.message);
  }
}

purge();
