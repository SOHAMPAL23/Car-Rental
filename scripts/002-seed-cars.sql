-- Seed sample data

-- Create an agency user first (password: admin123)
INSERT INTO users (name, email, password, role) VALUES
  ('Premium Car Rentals', 'admin@carrental.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4ezTSCXJq.NuZPKy', 'agency')
ON CONFLICT (email) DO NOTHING;

-- Insert sample cars (agency_id = 1)
INSERT INTO cars (agency_id, model, vehicle_number, seating_capacity, rent_per_day) VALUES
  (1, 'Toyota Camry 2024', 'ABC-1234', 5, 65.00),
  (1, 'Honda CR-V 2023', 'DEF-5678', 5, 85.00),
  (1, 'BMW 3 Series 2024', 'GHI-9012', 5, 120.00),
  (1, 'Tesla Model 3 2024', 'JKL-3456', 5, 110.00),
  (1, 'Ford Mustang 2023', 'MNO-7890', 4, 95.00),
  (1, 'Mercedes E-Class 2024', 'PQR-1122', 5, 145.00),
  (1, 'Chevrolet Suburban 2024', 'STU-3344', 8, 100.00),
  (1, 'Audi A4 2024', 'VWX-5566', 5, 115.00);
