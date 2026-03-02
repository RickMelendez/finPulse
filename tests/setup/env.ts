// Set stub environment variables before any module loads.
// This allows integration tests that test validation logic to run without
// a real Supabase project configured.
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'placeholder-service-key';
process.env.NODE_ENV = 'test';
