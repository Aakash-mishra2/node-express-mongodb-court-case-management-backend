
const { query } = require('../config/database');

class Case {
    static async deleteById(id) {
        // Delete related hearings
        await query('DELETE FROM hearings WHERE case_id = $1', [id]);
        // Delete related documents
        await query('DELETE FROM documents WHERE case_id = $1', [id]);
        // Optionally delete related notifications (if any)
        await query('DELETE FROM notifications WHERE user_id = (SELECT plaintiff_id FROM cases WHERE id = $1)', [id]);
        // Delete the case itself
        await query('DELETE FROM cases WHERE id = $1', [id]);
        return true;
    }
    constructor(data) {
        this.id = data.id;
        this.caseTitle = data.case_title;
        this.caseType = data.case_type;
        this.summary = data.summary;
        this.registrationFees = data.registration_fees;
        this.status = data.status;
        this.plaintiffId = data.plaintiff_id;
        this.lawyerId = data.lawyer_id;
        this.judgeId = data.judge_id;
        this.courtId = data.court_id;
        this.createdAt = data.created_at;
        this.updatedAt = data.updated_at;
    }

    static async create(caseData) {
        const { caseTitle, caseType, summary, registrationFees, plaintiffId, lawyerId, judgeId, courtId } = caseData;
        const result = await query(
            `INSERT INTO cases (case_title, case_type, summary, registration_fees, plaintiff_id, lawyer_id, judge_id, court_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [caseTitle, caseType, summary, registrationFees, plaintiffId, lawyerId, judgeId, courtId]
        );
        return new Case(result.rows[0]);
    }

    static async findById(id) {
        const result = await query(
            `SELECT c.*, 
                    l.full_name as lawyer_name, l.enrollment_number,
                    j.judge_name, j.judge_id,
                    co.court_name, co.court_address,
                    ci.full_name as plaintiff_name, ci.email as plaintiff_email
             FROM cases c
             LEFT JOIN lawyers l ON c.lawyer_id = l.id
             LEFT JOIN judges j ON c.judge_id = j.id
             LEFT JOIN courts co ON c.court_id = co.id
             LEFT JOIN citizens ci ON c.plaintiff_id = ci.id
             WHERE c.id = $1`,
            [id]
        );
        return result.rows.length ? result.rows[0] : null;
    }

    static async findAll() {
        const result = await query(
            `SELECT c.*, 
                    l.full_name as lawyer_name,
                    j.judge_name,
                    co.court_name,
                    ci.full_name as plaintiff_name
             FROM cases c
             LEFT JOIN lawyers l ON c.lawyer_id = l.id
             LEFT JOIN judges j ON c.judge_id = j.id
             LEFT JOIN courts co ON c.court_id = co.id
             LEFT JOIN citizens ci ON c.plaintiff_id = ci.id
             ORDER BY c.created_at DESC`
        );
        return result.rows;
    }

    static async findByUserId(userId, statusFilter = null) {
        let sqlQuery = `
            SELECT c.*, 
                   l.full_name as lawyer_name,
                   j.judge_name,
                   co.court_name
            FROM cases c
            LEFT JOIN lawyers l ON c.lawyer_id = l.id
            LEFT JOIN judges j ON c.judge_id = j.id
            LEFT JOIN courts co ON c.court_id = co.id
            WHERE c.plaintiff_id = $1
        `;
        
        const params = [userId];
        
        if (statusFilter) {
            sqlQuery += ' AND c.status = $2';
            params.push(statusFilter);
        }
        
        sqlQuery += ' ORDER BY c.created_at DESC';
        
        const result = await query(sqlQuery, params);
        return result.rows;
    }

    async update(updateData) {
        const { caseTitle, caseType, summary, status, lawyerId, judgeId, courtId } = updateData;
        const result = await query(
            `UPDATE cases 
             SET case_title = $1, case_type = $2, summary = $3, status = $4, 
                 lawyer_id = $5, judge_id = $6, court_id = $7, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $8 RETURNING *`,
            [caseTitle, caseType, summary, status, lawyerId, judgeId, courtId, this.id]
        );
        return new Case(result.rows[0]);
    }

    async delete() {
        await query('DELETE FROM cases WHERE id = $1', [this.id]);
        return true;
    }

    async getHearings() {
        const result = await query(
            'SELECT * FROM hearings WHERE case_id = $1 ORDER BY hearing_date DESC',
            [this.id]
        );
        return result.rows;
    }

    async getDocuments() {
        const result = await query(
            'SELECT * FROM documents WHERE case_id = $1 ORDER BY created_at DESC',
            [this.id]
        );
        return result.rows;
    }
}

module.exports = Case;
