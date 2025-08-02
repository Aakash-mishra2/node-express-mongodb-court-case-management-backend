
-- Court Case Management System Database Schema

-- Create Citizens table
CREATE TABLE IF NOT EXISTS citizens (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address_state VARCHAR(100),
    address_district VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Lawyers table
CREATE TABLE IF NOT EXISTS lawyers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    enrollment_number VARCHAR(255) UNIQUE NOT NULL,
    bar_council_affiliation VARCHAR(255),
    practice_certificate VARCHAR(255),
    office_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Courts table
CREATE TABLE IF NOT EXISTS courts (
    id SERIAL PRIMARY KEY,
    court_name VARCHAR(255) NOT NULL,
    court_address TEXT,
    court_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Judges table
CREATE TABLE IF NOT EXISTS judges (
    id SERIAL PRIMARY KEY,
    judge_name VARCHAR(255) NOT NULL,
    judge_id VARCHAR(100) UNIQUE,
    court_id INTEGER REFERENCES courts(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Cases table
CREATE TABLE IF NOT EXISTS cases (
    id SERIAL PRIMARY KEY,
    case_title VARCHAR(255),
    case_type VARCHAR(100),
    summary TEXT,
    registration_fees DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    plaintiff_id INTEGER NOT NULL REFERENCES citizens(id),
    lawyer_id INTEGER REFERENCES lawyers(id),
    judge_id INTEGER REFERENCES judges(id),
    court_id INTEGER REFERENCES courts(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Hearings table
CREATE TABLE IF NOT EXISTS hearings (
    id SERIAL PRIMARY KEY,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    hearing_date DATE,
    hearing_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Documents table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
    lawyer_id INTEGER REFERENCES lawyers(id),
    document_title VARCHAR(255),
    file_name VARCHAR(255),
    file_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Chat table
CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    message TEXT,
    sender_id INTEGER REFERENCES citizens(id),
    type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cases_plaintiff ON cases(plaintiff_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_case ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_hearings_case ON hearings(case_id);

-- Insert some sample data
INSERT INTO courts (court_name, court_address, court_id) VALUES 
('Delhi High Court', 'Delhi, India', 'DHC001'),
('Mumbai High Court', 'Mumbai, India', 'MHC001'),
('Kolkata High Court', 'Kolkata, India', 'KHC001')
ON CONFLICT (court_id) DO NOTHING;

INSERT INTO judges (judge_name, judge_id, court_id) VALUES 
('Justice A.K. Sharma', 'J001', 1),
('Justice B.K. Singh', 'J002', 2),
('Justice C.K. Verma', 'J003', 3)
ON CONFLICT (judge_id) DO NOTHING;
