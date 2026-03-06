import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Google OAuth login for customers
export const googleAuth = async (req, res) => {
  const { name, email, googleId } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      if (!user.googleId) { user.googleId = googleId; await user.save(); }
    } else {
      user = await User.create({ name, email, googleId, role: 'customer' });
    }
    res.status(200).json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during Google Auth' });
  }
};

// Staff login with email + password
export const staffLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, role: 'respondent' }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'No staff account found with this email.' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }
    res.status(200).json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during staff login' });
  }
};
