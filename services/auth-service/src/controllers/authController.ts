import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { userRepository, UserRole } from '../models/userModel';
import { TokenService } from '../services/tokenService';
import { AuthRequest } from '../middleware/security';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password, role = 'customer' } = req.body;

      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists',
        });
      }

      // Password hashing with bcrypt salt rounds = 10
      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = await userRepository.create({
        name,
        email,
        passwordHash,
        role: role as UserRole,
        isActive: true,
      });

      const tokenData = await TokenService.issueTokens(newUser);

      res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: tokenData,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Server error during user registration',
        error: error.message,
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await userRepository.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials',
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account is deactivated. Please contact support.',
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password credentials',
        });
      }

      const tokenData = await TokenService.issueTokens(user);

      res.status(200).json({
        success: true,
        message: 'Authentication successful',
        data: tokenData,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Server error during login',
        error: error.message,
      });
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required in request body',
        });
      }

      const tokens = await TokenService.rotateRefreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Tokens rotated and refreshed successfully',
        data: tokens,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Token refresh failed',
      });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await TokenService.revokeRefreshToken(refreshToken);
      }

      res.status(200).json({
        success: true,
        message: 'Logged out successfully. Refresh token revoked.',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error during logout process',
        error: error.message,
      });
    }
  }

  static async me(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const user = await userRepository.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const { passwordHash, refreshTokens, ...safeUser } = user;
      res.status(200).json({
        success: true,
        data: safeUser,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async verify(req: Request, res: Response) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, message: 'Token required' });
      }

      const decoded = TokenService.verifyAccessToken(token);
      res.status(200).json({
        success: true,
        valid: true,
        data: decoded,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        valid: false,
        message: error.message,
      });
    }
  }

  static async listUsers(req: Request, res: Response) {
    try {
      const users = await userRepository.getAll();
      res.status(200).json({
        success: true,
        total: users.length,
        data: users,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
