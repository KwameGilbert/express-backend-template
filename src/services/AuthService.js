import { UserModel } from '../models/UserModel.js';
import { generateTokens, verifyRefreshToken } from '../middlewares/auth.js';
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '../utils/errors.js';
import { generateRandomString } from '../utils/helpers.js';

/**
 * Authentication Service
 */
export class AuthService {
  /**
   * Register a new user
   */
  static async register(data) {
    const { email, password, first_name, last_name, role = 'user' } = data;

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Create user
    const user = await UserModel.create({
      email: email.toLowerCase(),
      password,
      first_name,
      last_name,
      role,
      status: 'active',
    });

    // Generate tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokens(tokenPayload);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Login a user
   */
  static async login(email, password) {
    // Find user with password hash
    const user = await UserModel.findByEmailWithPassword(email.toLowerCase());

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('Your account is not active');
    }

    // Verify password
    const isValidPassword = await UserModel.comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    await UserModel.update(user.id, {
      last_login_at: new Date(),
    });

    // Generate tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokens(tokenPayload);

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);

      const tokenPayload = {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      const tokens = generateTokens(tokenPayload);

      return tokens;
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  /**
   * Change user password
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const isValid = await UserModel.verifyPassword(userId, currentPassword);

    if (!isValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    await UserModel.update(userId, {
      password: newPassword,
    });

    return true;
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email) {
    const user = await UserModel.findByEmail(email.toLowerCase());

    if (!user) {
      // Don't reveal if user exists
      return true;
    }

    const resetToken = generateRandomString(32);
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await UserModel.update(user.id, {
      password_reset_token: resetToken,
      password_reset_expires: resetExpires,
    });

    // TODO: Send email with reset link
    // EmailService.sendPasswordResetEmail(user.email, resetToken);

    return true;
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token, newPassword) {
    const user = await UserModel.findFirst({
      password_reset_token: token,
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    if (new Date(user.password_reset_expires) < new Date()) {
      throw new BadRequestError('Reset token has expired');
    }

    await UserModel.update(user.id, {
      password: newPassword,
      password_reset_token: null,
      password_reset_expires: null,
    });

    return true;
  }

  /**
   * Get current user profile
   */
  static async getProfile(userId) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Update current user profile
   */
  static async updateProfile(userId, data) {
    // Prevent updating sensitive fields
    const { password, role, status, ...safeData } = data;

    const user = await UserModel.update(userId, safeData);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }
}

export default AuthService;
