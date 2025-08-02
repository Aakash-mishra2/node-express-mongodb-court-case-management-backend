
const { pool } = require('../config/database');

async function insertDummyData() {
    try {
        console.log('Inserting dummy data...');

        // Insert dummy citizens
        const citizensResult = await pool.query(`
            INSERT INTO citizens (full_name, email, password, phone, address_state, address_district) VALUES
            ('John Doe', 'john.doe@email.com', 'hashedpass123', '+1234567890', 'Delhi', 'Central Delhi'),
            ('Jane Smith', 'jane.smith@email.com', 'hashedpass456', '+1234567891', 'Mumbai', 'Andheri'),
            ('Robert Johnson', 'robert.j@email.com', 'hashedpass789', '+1234567892', 'Kolkata', 'Salt Lake'),
            ('Mary Williams', 'mary.w@email.com', 'hashedpass101', '+1234567893', 'Chennai', 'T Nagar'),
            ('David Brown', 'david.b@email.com', 'hashedpass202', '+1234567894', 'Bangalore', 'Koramangala')
            ON CONFLICT (email) DO NOTHING
            RETURNING id, full_name;
        `);
        console.log('Inserted citizens:', citizensResult.rows);

        // Insert dummy lawyers
        const lawyersResult = await pool.query(`
            INSERT INTO lawyers (full_name, enrollment_number, bar_council_affiliation, practice_certificate, office_address) VALUES
            ('Advocate Priya Sharma', 'D/123/2015', 'Bar Council of Delhi', 'PC2015001', 'Supreme Court Bar Association, New Delhi'),
            ('Advocate Rajesh Kumar', 'M/456/2018', 'Bar Council of Maharashtra', 'PC2018002', 'Bombay High Court, Mumbai'),
            ('Advocate Sunita Verma', 'WB/789/2020', 'Bar Council of West Bengal', 'PC2020003', 'Calcutta High Court, Kolkata'),
            ('Advocate Vikram Singh', 'TN/321/2017', 'Bar Council of Tamil Nadu', 'PC2017004', 'Madras High Court, Chennai'),
            ('Advocate Neha Gupta', 'KA/654/2019', 'Bar Council of Karnataka', 'PC2019005', 'Karnataka High Court, Bangalore')
            ON CONFLICT (enrollment_number) DO NOTHING
            RETURNING id, full_name;
        `);
        console.log('Inserted lawyers:', lawyersResult.rows);

        // Insert dummy cases
        const casesResult = await pool.query(`
            INSERT INTO cases (case_title, case_type, summary, registration_fees, status, plaintiff_id, lawyer_id, judge_id, court_id) VALUES
            ('Property Dispute Case', 'Civil', 'Dispute over property ownership between two parties regarding ancestral land in Delhi', 5000.00, 'pending', 1, 1, 1, 1),
            ('Motor Vehicle Accident Claim', 'Motor Accident', 'Compensation claim for injuries sustained in road accident on Mumbai highway', 3000.00, 'in_progress', 2, 2, 2, 2),
            ('Employment Termination Case', 'Labor', 'Wrongful termination case filed by employee against IT company in Kolkata', 4000.00, 'pending', 3, 3, 3, 3),
            ('Consumer Protection Case', 'Consumer', 'Defective product complaint against electronics manufacturer', 2500.00, 'filed', 4, 4, 1, 1),
            ('Matrimonial Dispute', 'Family', 'Divorce proceedings with child custody and property settlement issues', 6000.00, 'in_progress', 5, 5, 2, 2)
            RETURNING id, case_title;
        `);
        console.log('Inserted cases:', casesResult.rows);

        // Insert dummy hearings
        await pool.query(`
            INSERT INTO hearings (case_id, hearing_date, hearing_time) VALUES
            (1, '2024-02-15', '10:30:00'),
            (1, '2024-03-15', '10:30:00'),
            (2, '2024-02-20', '11:00:00'),
            (3, '2024-02-25', '14:30:00'),
            (4, '2024-03-01', '09:30:00'),
            (5, '2024-03-05', '15:00:00');
        `);
        console.log('Inserted hearings');

        // Insert dummy documents
        await pool.query(`
            INSERT INTO documents (case_id, lawyer_id, document_title, file_name, file_id) VALUES
            (1, 1, 'Property Title Deed', 'title_deed_001.pdf', 'DOC001'),
            (1, 1, 'Survey Settlement Records', 'survey_records_001.pdf', 'DOC002'),
            (2, 2, 'Medical Certificate', 'medical_cert_002.pdf', 'DOC003'),
            (2, 2, 'Police FIR Copy', 'fir_copy_002.pdf', 'DOC004'),
            (3, 3, 'Employment Contract', 'contract_003.pdf', 'DOC005'),
            (3, 3, 'Termination Letter', 'termination_003.pdf', 'DOC006'),
            (4, 4, 'Purchase Receipt', 'receipt_004.pdf', 'DOC007'),
            (5, 5, 'Marriage Certificate', 'marriage_cert_005.pdf', 'DOC008');
        `);
        console.log('Inserted documents');

        // Insert dummy notifications
        await pool.query(`
            INSERT INTO notifications (user_id, message, read) VALUES
            (1, 'Your case hearing is scheduled for 2024-02-15 at 10:30 AM', false),
            (1, 'New document uploaded to your case', false),
            (2, 'Your motor accident case status has been updated to in-progress', true),
            (3, 'Lawyer assigned to your employment case', false),
            (4, 'Your consumer complaint has been filed successfully', true),
            (5, 'Next hearing scheduled for your matrimonial case', false);
        `);
        console.log('Inserted notifications');

        // Insert dummy chat messages
        await pool.query(`
            INSERT INTO chats (message, sender_id, type) VALUES
            ('Hello, I need help with my property case', 1, 'user_message'),
            ('I have submitted all required documents', 2, 'user_message'),
            ('When is my next hearing scheduled?', 3, 'user_message'),
            ('Can you provide status update on my case?', 4, 'user_message'),
            ('I need to discuss settlement options', 5, 'user_message');
        `);
        console.log('Inserted chat messages');

        // Display summary
        const summary = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM citizens) as total_citizens,
                (SELECT COUNT(*) FROM lawyers) as total_lawyers,
                (SELECT COUNT(*) FROM courts) as total_courts,
                (SELECT COUNT(*) FROM judges) as total_judges,
                (SELECT COUNT(*) FROM cases) as total_cases,
                (SELECT COUNT(*) FROM hearings) as total_hearings,
                (SELECT COUNT(*) FROM documents) as total_documents,
                (SELECT COUNT(*) FROM notifications) as total_notifications,
                (SELECT COUNT(*) FROM chats) as total_chats;
        `);

        console.log('\n=== Database Summary ===');
        console.log('Citizens:', summary.rows[0].total_citizens);
        console.log('Lawyers:', summary.rows[0].total_lawyers);
        console.log('Courts:', summary.rows[0].total_courts);
        console.log('Judges:', summary.rows[0].total_judges);
        console.log('Cases:', summary.rows[0].total_cases);
        console.log('Hearings:', summary.rows[0].total_hearings);
        console.log('Documents:', summary.rows[0].total_documents);
        console.log('Notifications:', summary.rows[0].total_notifications);
        console.log('Chat Messages:', summary.rows[0].total_chats);
        console.log('========================\n');

        console.log('Dummy data insertion completed successfully!');
        
    } catch (error) {
        console.error('Error inserting dummy data:', error);
        process.exit(1);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

insertDummyData();
