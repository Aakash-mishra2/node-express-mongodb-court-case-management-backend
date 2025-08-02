const { pool } = require("../config/database");

async function removeDuplicates() {
    try {
        console.log("Removing duplicates from all tables...");

        // Define the queries for removing duplicates from the tables
        const queries = [
            // For citizens table
            `WITH cte AS (
                SELECT id, full_name, email, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn
                FROM citizens
            )
            DELETE FROM citizens
            WHERE id IN (SELECT id FROM cte WHERE rn > 1);`,

            // For lawyers table
            `WITH cte AS (
                SELECT id, full_name, enrollment_number, ROW_NUMBER() OVER (PARTITION BY enrollment_number ORDER BY id) AS rn
                FROM lawyers
            )
            DELETE FROM lawyers
            WHERE id IN (SELECT id FROM cte WHERE rn > 1);`,

            // For cases table
            `WITH cte AS (
                SELECT id, case_title, ROW_NUMBER() OVER (PARTITION BY case_title ORDER BY id) AS rn
                FROM cases
            )
            DELETE FROM cases
            WHERE id IN (SELECT id FROM cte WHERE rn > 1);`,

            // Repeat similar queries for other tables if necessary
            // For example, hearings, documents, notifications, and chats...
        ];

        for (const query of queries) {
            await pool.query(query);
        }

        console.log("Duplicate records removed successfully!");
    } catch (error) {
        console.error("Error removing duplicates:", error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

removeDuplicates();
