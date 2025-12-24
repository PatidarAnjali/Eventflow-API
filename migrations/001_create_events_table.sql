CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,

    external_id VARCHAR(255) UNIQUE,
    source VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    location JSONB,
    category VARCHAR(100),
    url VARCHAR(1000),
    image_url VARCHAR(1000),
    is_free BOOLEAN DEFAULT false,
    price DECIMAL(10,2),
    organizer VARCHAR(255),
    raw_data JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source);
