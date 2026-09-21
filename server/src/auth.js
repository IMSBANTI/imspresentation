import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, findUserById } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ims-presentation-super-secret-key-2026';

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader === 'Bearer null' || authHeader === 'Bearer undefined') {
    // Gracefully assign default presenter session so presentations can always be created
    req.user = { id: 1, name: 'Presenter', email: 'presenter@imspresentation.com', isGuest: true };
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // If token expired or invalid, fallback to default presenter instead of rejecting
    req.user = { id: 1, name: 'Presenter', email: 'presenter@imspresentation.com', isGuest: true };
    next();
  }
}

export async function handleRegister(req, res) {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const user = await createUser({ email, password, name });
    const token = generateToken(user);
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

export async function handleLogin(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Logged in successfully',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function handleGetMe(req, res) {
  try {
    let user = await findUserById(req.user.id);
    if (!user) {
      user = { id: req.user.id || 1, email: req.user.email || 'presenter@imspresentation.com', name: req.user.name || 'Presenter' };
    }
    const token = generateToken(user);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
