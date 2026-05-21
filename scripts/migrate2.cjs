const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.mqgequubhvrrgvkoipbg',
  password: 'Kam@05000',
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => { console.log('Connected!'); return client.query('SELECT 1 as test'); })
  .then(r => { console.log('Query ok:', r.rows); return client.end(); })
  .catch(e => console.error('Failed:', e.message));
