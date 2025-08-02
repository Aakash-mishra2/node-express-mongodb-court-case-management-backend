
const { query } = require('../config/database');

class Citizen {
    constructor(data) {
        this.id = data.id;
        this.fullName = data.full_name;
        this.email = data.email;
        this.password = data.password;
        this.phone = data.phone;
        this.addressState = data.address_state;
        this.addressDistrict = data.address_district;
        this.createdAt = data.created_at;
        this.updatedAt = data.updated_at;
    }

    static async create(citizenData) {
        const { fullName, email, password, phone, addressState, addressDistrict } = citizenData;
        const result = await query(
            `INSERT INTO citizens (full_name, email, password, phone, address_state, address_district) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [fullName, email, password, phone, addressState, addressDistrict]
        );
        return new Citizen(result.rows[0]);
    }

    static async findById(id) {
        const result = await query('SELECT * FROM citizens WHERE id = $1', [id]);
        return result.rows.length ? new Citizen(result.rows[0]) : null;
    }

    static async findByEmail(email) {
        const result = await query('SELECT * FROM citizens WHERE email = $1', [email]);
        return result.rows.length ? new Citizen(result.rows[0]) : null;
    }

    static async findAll() {
        const result = await query('SELECT * FROM citizens ORDER BY created_at DESC');
        return result.rows.map(row => new Citizen(row));
    }

    async update(updateData) {
        const { fullName, phone, addressState, addressDistrict } = updateData;
        const result = await query(
            `UPDATE citizens 
             SET full_name = $1, phone = $2, address_state = $3, address_district = $4, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $5 RETURNING *`,
            [fullName, phone, addressState, addressDistrict, this.id]
        );
        return new Citizen(result.rows[0]);
    }

    async updatePassword(newPassword) {
        const result = await query(
            'UPDATE citizens SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [newPassword, this.id]
        );
        return new Citizen(result.rows[0]);
    }

    async delete() {
        await query('DELETE FROM citizens WHERE id = $1', [this.id]);
        return true;
    }

    async getCases() {
        const result = await query(
            `SELECT c.*, 
                    l.full_name as lawyer_name, l.enrollment_number,
                    j.judge_name, j.judge_id,
                    co.court_name, co.court_address
             FROM cases c
             LEFT JOIN lawyers l ON c.lawyer_id = l.id
             LEFT JOIN judges j ON c.judge_id = j.id
             LEFT JOIN courts co ON c.court_id = co.id
             WHERE c.plaintiff_id = $1
             ORDER BY c.created_at DESC`,
            [this.id]
        );
        return result.rows;
    }
}

module.exports = Citizen;
