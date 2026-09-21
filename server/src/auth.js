import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, findUserById } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ims-presentation-super-secret-key-2026';
const IMS_ACCESS_CODE = (process.env.IMS_ACCESS_CODE || 'IMS2026').trim().toUpperCase();
const ALLOWED_DOMAINS = (process.env.ALLOWED_DOMAINS || 'ims.com,ims-bd.com,imsltd.com,imsbd.com')
  .split(',')
  .map(d => d.trim().toLowerCase())
  .filter(Boolean);

export function isAuthorizedImsEmail(email) {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1].toLowerCase().trim();
  return ALLOWED_DOMAINS.some(allowed => domain === allowed || domain.endsWith('.' + allowed)) ||
         domain.includes('ims');
}

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
    return res.status(401).json({ 
      error: 'Unauthorized: Sign in with your IMS account to manage presentations.' 
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ 
      error: 'Session expired or invalid. Please sign in with your IMS account.' 
    });
  }
}

export async function handleRegister(req, res) {
  const { email, password, name, imsCode } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  // Restrict registration to IMS Team:
  // Must have an IMS company email OR provide the IMS Organization Access Code
  const isIms = isAuthorizedImsEmail(email);
  const codeValid = imsCode && imsCode.trim().toUpperCase() === IMS_ACCESS_CODE;

  if (!isIms && !codeValid) {
    return res.status(403).json({ 
      error: 'Access restricted: Only authorized IMS team members can create presenter accounts. Please use your IMS company email or enter the IMS Organization Passcode.' 
    });
  }

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists. Please sign in.' });
    }

    const user = await createUser({ email, password, name });
    const token = generateToken(user);
    res.status(201).json({
      message: 'IMS Presenter account created successfully',
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
