/**
 * Script to run the vocabulary management migration
 * This creates the necessary tables in Supabase
 */

const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🚀 Running Vocabulary Management Migration...\n');

  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: .env.local file not found!');
    console.log('\nPlease create .env.local with your Supabase credentials:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=your-project-url');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
    process.exit(1);
  }

  // Load environment variables manually
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  const env = {};
  
  envLines.forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim();
    }
  });

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Supabase credentials not found in .env.local');
    console.log('\nMake sure your .env.local contains:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=your-project-url');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
    process.exit(1);
  }

  console.log('✅ Found Supabase credentials');
  console.log(`📍 Project URL: ${supabaseUrl}\n`);

  // Read migration file
  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '002_vocabulary_management.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Error: Migration file not found at:', migrationPath);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  console.log('✅ Loaded migration file\n');

  // Import Supabase client
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔄 Executing migration...\n');

  try {
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // If exec_sql doesn't exist, try direct execution (this won't work with anon key, but we'll provide instructions)
      console.error('❌ Migration failed with anon key (expected)');
      console.log('\n📋 MANUAL MIGRATION REQUIRED:\n');
      console.log('Please follow these steps:');
      console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
      console.log('2. Select your project');
      console.log('3. Go to "SQL Editor" in the left sidebar');
      console.log('4. Click "New Query"');
      console.log('5. Copy and paste the contents of: supabase/migrations/002_vocabulary_management.sql');
      console.log('6. Click "Run" to execute the migration\n');
      console.log('The migration file is located at:');
      console.log(migrationPath);
      console.log('\n✨ After running the migration, your vocabulary management system will be ready!');
      process.exit(0);
    }

    console.log('✅ Migration completed successfully!\n');
    console.log('🎉 Your vocabulary management system is now ready to use!');
    console.log('\nNext steps:');
    console.log('1. Go to /teacher in your app');
    console.log('2. Click "Create New Game Link"');
    console.log('3. Upload vocabulary and select games');
    console.log('4. Share the generated link with students!\n');

  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    console.log('\n📋 MANUAL MIGRATION REQUIRED:\n');
    console.log('Please follow these steps:');
    console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to "SQL Editor" in the left sidebar');
    console.log('4. Click "New Query"');
    console.log('5. Copy and paste the contents of: supabase/migrations/002_vocabulary_management.sql');
    console.log('6. Click "Run" to execute the migration\n');
    console.log('The migration file is located at:');
    console.log(migrationPath);
    console.log('\n✨ After running the migration, your vocabulary management system will be ready!');
  }
}

runMigration().catch(console.error);
