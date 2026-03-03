// Set stub environment variables before any module loads.
// This allows integration tests that test validation logic to run without
// a real database configured.
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-unit-tests-only';
process.env.NODE_ENV = 'test';
