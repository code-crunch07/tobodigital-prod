import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import PasswordReset from '../models/PasswordReset';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../services/email';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Register/Signup
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      ...(phone != null && phone !== '' && { phone: String(phone).trim() }),
      password: hashedPassword,
      role: role || 'customer',
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    const userData = user.toObject();
    delete (userData as any).password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userData,
        token,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.',
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    const userData = user.toObject();
    delete (userData as any).password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get current user (verify token)
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

// Middleware to verify JWT token
export const authenticateToken = (req: Request, res: Response, next: Function) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch (error: any) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

// Middleware to check admin role
export const requireAdmin = (req: Request, res: Response, next: Function) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }

    (req as any).user = decoded;
    next();
  } catch (error: any) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

// Middleware: allow admin or shop_manager (for products, orders, categories, etc.)
export const requireAdminOrShopManager = (req: Request, res: Response, next: Function) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.role !== 'admin' && decoded.role !== 'shop_manager') {
      return res.status(403).json({
        success: false,
        message: 'Admin or shop manager access required',
      });
    }

    (req as any).user = decoded;
    next();
  } catch (error: any) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

// Optional auth: set req.user if valid token present, do not reject if missing
export const optionalAuth = (req: Request, res: Response, next: Function) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return next();
    }
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch {
    next();
  }
};

// List users (admin only) - for Settings > Admin Users
export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to fetch users',
    });
  }
};

// Update user (admin only) - activate/deactivate
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reqUser = (req as any).user;
    const { isActive, role } = req.body;
    if (id === reqUser.userId && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account',
      });
    }
    const updateData: any = {};
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (role && ['admin', 'shop_manager', 'customer'].includes(role)) updateData.role = role;
    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to update user',
    });
  }
};

// Forgot password (send reset link via Brevo SMTP)
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    // Always return success to avoid email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.',
      });
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await PasswordReset.deleteMany({ email: normalizedEmail });
    await PasswordReset.create({ email: normalizedEmail, token, expiresAt });
    const dashboardUrl = process.env.DASHBOARD_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${dashboardUrl.replace(/\/$/, '')}/reset-password?token=${token}`;
    const sent = await sendEmail({
      to: normalizedEmail,
      subject: 'Reset your Tobo Digital password',
      text: `You requested a password reset. Open this link to set a new password (valid for 1 hour):\n${resetLink}\n\nIf you didn't request this, ignore this email.`,
      html: `<p>You requested a password reset.</p><p><a href="${resetLink}">Reset your password</a> (valid for 1 hour).</p><p>If you didn't request this, ignore this email.</p>`,
    });
    if (!sent) {
      return res.status(503).json({
        success: false,
        message: 'Email service is not configured. Please contact support.',
      });
    }
    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error?.message || error);
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to send reset email',
    });
  }
};

// Reset password (with token from email link)
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }
    const resetRecord = await PasswordReset.findOne({ token }).sort({ createdAt: -1 });
    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token. Please request a new link.',
      });
    }
    const user = await User.findOne({ email: resetRecord.email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token.',
      });
    }
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    await PasswordReset.deleteMany({ email: resetRecord.email });
    res.json({
      success: true,
      message: 'Password updated successfully. You can now log in.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to reset password',
    });
  }
};

// Change password (authenticated user)
export const changePassword = async (req: Request, res: Response) => {
  try {
    const reqUser = (req as any).user;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }
    const user = await User.findById(reqUser.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message || 'Failed to change password',
    });
  }
};

