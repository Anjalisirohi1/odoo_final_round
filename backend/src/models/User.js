const { pool } = require('../config/db');

class User {
  static async create({ name, email, passwordHash, roleId }) {
    const query = `
      INSERT INTO users (name, email, password_hash, role_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role_id, created_at;
    `;
    const values = [name, email, passwordHash, roleId];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = `
      SELECT u.*, r.name as role_name 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.email = $1
    `;
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT u.id, u.name, u.email, u.role_id, r.name as role_name 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = User;
