-- DROP tables if they exist
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS room_members CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Schema
CREATE TABLE IF NOT EXISTS users 
(
    id uuid PRIMARY KEY, 
    email VARCHAR(320) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    password BYTEA NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms
(
    id uuid PRIMARY KEY, 
    name TEXT NOT NULL,
    owner uuid REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS room_members
(
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE, 
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (room_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages
(
  id uuid PRIMARY KEY,
  content TEXT NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT NOW(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS roles
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS user_roles
(
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- SEED DATA 
-- USED TO :Initial data inserted into a database, typically used to populate it with default or sample entries
-- This SQL file is a seed script used to seed the database with initial data.
-- This is often part of initial setup routine in development and testing environments

-- Insert roles
INSERT INTO roles (name) VALUES ('user') ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name;
INSERT INTO roles (name) VALUES ('admin') ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name;

-- Insert users (passwords are bcrypt hashes of 'password1', 'password2', 'password3')
INSERT INTO users (id, email, name, password, created) VALUES
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com', 'Alice', '$2a$10$sUqpU2j.Bgr2Q45znyAIvOnh1JnGrMY6EwBLwLbHZnQT.glD59jwa', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com', 'Bob', '$2a$10$F/fQYF43Fpy8pGUBc0SLFu1dmMAm2W2yq6LHUTgMcfCxGAqGVCcU6', NOW()),
  ('33333333-3333-3333-3333-333333333333', 'carol@example.com', 'Carol', '$2a$10$hPEAJ24iFgrFj6/tdjmxEuNt3jeWrhe3MbYPX7JPWAgQQDR1DFSJi', NOW())
ON CONFLICT (email) DO NOTHING;

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id) VALUES
  ('11111111-1111-1111-1111-111111111111', (SELECT id FROM roles WHERE name='admin')),
  ('22222222-2222-2222-2222-222222222222', (SELECT id FROM roles WHERE name='user')),
  ('33333333-3333-3333-3333-333333333333', (SELECT id FROM roles WHERE name='user'))
ON CONFLICT DO NOTHING;

-- Insert rooms
INSERT INTO rooms (id, name, owner) VALUES
  ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'General', '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'Random', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;

-- Insert messages
INSERT INTO messages (id, content, user_id, room_id, created) VALUES
  ('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'Hello everyone!', '11111111-1111-1111-1111-111111111111', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', NOW()),
  ('bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'Hi Alice!', '22222222-2222-2222-2222-222222222222', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', NOW()),
  ('bbbbbbb3-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'Welcome to Random!', '33333333-3333-3333-3333-333333333333', 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', NOW())
ON CONFLICT (id) DO NOTHING;