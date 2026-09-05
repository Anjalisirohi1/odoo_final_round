const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { pool } = require('../config/db');

// --- Token Utilities ---

const generateAccessToken = (id, roleName) => {
  const secret = process.env.JWT_SECRET;
  return jwt.sign({ id, role: roleName }, secret, { expiresIn: '15m' });
};

const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// --- Controllers ---

exports.signup = async (req, res) => {
  try {
    const { fullName, email, password, teamSelector } = req.body;

    let requestedRole = teamSelector || 'CUSTOMER';

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

    // Create user
    const user = await User.create({
      name: fullName,
      email,
      passwordHash,
      roleId
    });

    if (user) {
      // Generate tokens
      const accessToken = generateAccessToken(user.id, requestedRole);
      const refreshToken = generateRefreshToken();
      const refreshTokenHash = hashToken(refreshToken);

      // Store refresh token in DB
      await pool.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '7 days')`,
        [user.id, refreshTokenHash]
      );

      // Set refresh token as HttpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        id: user.id,
        fullName: user.name,
        email: user.email,
        role: requestedRole,
        accessToken
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

    const user = await User.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      // Generate tokens
      const accessToken = generateAccessToken(user.id, user.role_name);
      const refreshToken = generateRefreshToken();
      const refreshTokenHash = hashToken(refreshToken);

      // Store refresh token in DB
      await pool.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '7 days')`,
        [user.id, refreshTokenHash]
      );

      // Set refresh token as HttpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        id: user.id,
        fullName: user.name,
        email: user.email,
        role: user.role_name,
        accessToken
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    const tokenHash = hashToken(refreshToken);

    // Find the refresh token in DB
    const result = await pool.query(
      `SELECT rt.*, u.name, r.name AS role_name
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       JOIN roles r ON u.role_id = r.id
       WHERE rt.token_hash = $1`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const tokenRecord = result.rows[0];

    // Check if revoked
    if (tokenRecord.revoked_at) {
      return res.status(401).json({ message: 'Refresh token has been revoked' });
    }

    // Check if expired
    if (new Date(tokenRecord.expires_at) < new Date()) {
      return res.status(401).json({ message: 'Refresh token has expired' });
    }

    // Generate new access token
    const accessToken = generateAccessToken(tokenRecord.user_id, tokenRecord.role_name);

    res.json({ accessToken });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ message: 'Server error during token refresh' });
  }
};

exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      // Revoke the refresh token in DB
      await pool.query(
        `UPDATE refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = $1`,
        [hashToken(refreshToken)]
      );
    }

    // Clear the cookie
    res.clearCookie('refreshToken');

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};
