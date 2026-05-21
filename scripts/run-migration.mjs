import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mqgequubhvrrgvkoipbg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZ2VxdXViaHZycmd2a29pcGJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTAzMjgxMiwiZXhwIjoyMDk0NjA4ODEyfQ.k08MziQYS3gECwOfFP_UCgZwRuffdv9Ogp3OhyRKLw0'
);

// Run each statement individually via RPC or check columns
async function columnExists(table, column) {
  const { data } = await supabase
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_schema', 'public')
    .eq('table_name', table)
    .eq('column_name', column)
    .maybeSingle();
  return !!data;
}

async function tableExists(table) {
  const { data } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_name', table)
    .maybeSingle();
  return !!data;
}

async function main() {
  console.log('Checking current DB state...\n');

  const checks = [
    { label: 'messages table',         exists: await tableExists('messages') },
    { label: 'notifications table',    exists: await tableExists('notifications') },
    { label: 'approvalStatus column',  exists: await columnExists('products', 'approvalStatus') },
    { label: 'isBanned column',        exists: await columnExists('users', 'isBanned') },
  ];

  for (const c of checks) {
    console.log(`  ${c.exists ? '✅' : '❌'} ${c.label}`);
  }

  const missing = checks.filter(c => !c.exists);
  if (missing.length === 0) {
    console.log('\n✅ All tables/columns already exist — no migration needed!');
  } else {
    console.log(`\n⚠️  Missing: ${missing.map(c => c.label).join(', ')}`);
    console.log('Please run scripts/seed-messaging-moderation.sql in Supabase SQL Editor.');
  }
}

main().catch(console.error);
