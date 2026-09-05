const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { pool } = require('../config/db');

const generateToken = (id, roleName) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_for_development_only';
  return jwt.sign({ id, role: roleName }, secret, { expiresIn: '30d' });
};

exports.signup = async (req, res) => {
  try {
    const { fullName, email, password, teamSelector } = req.body;

    // Use the role from the UI directly
    let requestedRole = teamSelector || 'CUSTOMER'; // default

    // Fetch the role_id from the DB
    const roleQuery = await pool.query('SELECT id FROM roles WHERE name = $1', [requestedRole]);
    if (roleQuery.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid role assignment' });
    }
    const roleId = roleQuery.rows[0].id;

    // Check if user exists
    const userExists = await User.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user (using fullName from UI as name)
    const user = await User.create({
      name: fullName,
      email,
      passwordHash,
      roleId
    });

    if (user) {
      res.status(201).json({
        id: user.id,
        fullName: user.name,
        email: user.email,
        role: requestedRole,
        token: generateToken(user.id, requestedRole)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      res.json({
        id: user.id,
        fullName: user.name,
        email: user.email,
        role: user.role_name,
        token: generateToken(user.id, user.role_name)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};
