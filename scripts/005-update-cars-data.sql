-- Update existing cars with proper data
UPDATE cars SET brand = 'Toyota', year = 2023, price_per_day = 50.00, description = 'Reliable and fuel-efficient sedan perfect for city driving', available = true WHERE model = 'Camry';
UPDATE cars SET brand = 'Honda', year = 2023, price_per_day = 45.00, description = 'Compact and economical, great for everyday commuting', available = true WHERE model = 'Civic';
UPDATE cars SET brand = 'BMW', year = 2024, price_per_day = 120.00, description = 'Luxury performance sedan with premium features', available = true WHERE model = 'X5';
UPDATE cars SET brand = 'Mercedes', year = 2024, price_per_day = 150.00, description = 'Ultimate luxury SUV with advanced technology', available = true WHERE model = 'GLE';
UPDATE cars SET brand = 'Ford', year = 2023, price_per_day = 55.00, description = 'Versatile SUV with excellent cargo space', available = true WHERE model = 'Explorer';

-- Add more cars
INSERT INTO cars (model, brand, year, vehicle_number, rent_per_day, price_per_day, seating_capacity, description, available, agency_id)
SELECT 'Model 3', 'Tesla', 2024, 'EV-TESLA-001', 100.00, 100.00, 5, 'Electric vehicle with autopilot and long range battery', true, id FROM users WHERE role = 'agency' LIMIT 1;

INSERT INTO cars (model, brand, year, vehicle_number, rent_per_day, price_per_day, seating_capacity, description, available, agency_id)
SELECT 'Wrangler', 'Jeep', 2023, 'JEEP-WRG-001', 85.00, 85.00, 4, 'Rugged off-road vehicle perfect for adventure', true, id FROM users WHERE role = 'agency' LIMIT 1;

INSERT INTO cars (model, brand, year, vehicle_number, rent_per_day, price_per_day, seating_capacity, description, available, agency_id)
SELECT 'Mustang', 'Ford', 2024, 'FORD-MST-001', 95.00, 95.00, 4, 'Classic American muscle car with powerful V8 engine', true, id FROM users WHERE role = 'agency' LIMIT 1;
