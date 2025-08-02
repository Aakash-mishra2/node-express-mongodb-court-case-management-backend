const { query } = require('../config/database');

class Chat {
  constructor(data) {
    this.id = data.id;
    this.message = data.message;
    this.sender = data.sender;
    this.type = data.type;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static async create(chatData) {
    const { message, sender, type } = chatData;
    const result = await query(
      `INSERT INTO chats (message, sender, type) VALUES ($1, $2, $3) RETURNING *`,
      [message, sender, type]
    );
    return new Chat(result.rows[0]);
  }

  static async findById(id) {
    const result = await query('SELECT * FROM chats WHERE id = $1', [id]);
    return result.rows.length ? new Chat(result.rows[0]) : null;
  }

  static async findAll() {
    const result = await query('SELECT * FROM chats ORDER BY created_at DESC');
    return result.rows.map(row => new Chat(row));
  }
}

module.exports = Chat;
