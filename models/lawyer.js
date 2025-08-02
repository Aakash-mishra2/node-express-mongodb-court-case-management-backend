const { query } = require('../config/database');

class Lawyer {
    constructor(data) {
        this.id = data.id;
        this.fullName = data.full_name;
        this.enrollmentNumber = data.enrollment_number;
        this.barCouncilAffiliation = data.bar_council_affiliation;
        this.practiceCertificate = data.practice_certificate;
        this.officeAddress = data.office_address;
        this.cases = data.cases;
        this.createdAt = data.created_at;
        this.updatedAt = data.updated_at;
    }

    static async create(lawyerData) {
        const { fullName, enrollmentNumber, barCouncilAffiliation, practiceCertificate, officeAddress } = lawyerData;
        const result = await query(
            `INSERT INTO lawyers (full_name, enrollment_number, bar_council_affiliation, practice_certificate, office_address) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [fullName, enrollmentNumber, barCouncilAffiliation, practiceCertificate, officeAddress]
        );
        return new Lawyer(result.rows[0]);
    }

    static async findById(id) {
        const result = await query('SELECT * FROM lawyers WHERE id = $1', [id]);
        return result.rows.length ? new Lawyer(result.rows[0]) : null;
    }

    static async findAll() {
        const result = await query('SELECT * FROM lawyers ORDER BY created_at DESC');
        return result.rows.map(row => new Lawyer(row));
    }
}

module.exports = Lawyer;
