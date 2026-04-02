-- Add missing columns to cars table
ALTER TABLE cars ADD COLUMN IF NOT EXISTS brand VARCHAR(255);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS year INTEGER DEFAULT 2024;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS price_per_day NUMERIC(10, 2);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT true;

-- Add missing columns to bookings table  
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';

-- Copy rent_per_day to price_per_day if it exists
UPDATE cars SET price_per_day = rent_per_day WHERE price_per_day IS NULL AND rent_per_day IS NOT NULL;

-- Update existing cars with brand from model if brand is null
UPDATE cars SET brand = SPLIT_PART(model, ' ', 1) WHERE brand IS NULL AND model IS NOT NULL;
