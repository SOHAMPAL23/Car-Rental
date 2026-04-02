-- Car Rental Database Schema

-- Users table (customers and agencies)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'agency')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cars table (managed by agencies)
CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  model VARCHAR(255) NOT NULL,
  vehicle_number VARCHAR(50) NOT NULL,
  seating_capacity INTEGER NOT NULL,
  rent_per_day DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  days INTEGER NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cars_agency_id ON cars(agency_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_car_id ON bookings(car_id);
