-- Keep the users table aligned with the registration API expectations.
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'customer';
