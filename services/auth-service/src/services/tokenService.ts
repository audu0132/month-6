import jwt from 'jsonwebtoken';
import { User, userRepository } from '../models/userModel';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production-2026-auth';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-change-in-production-2026-auth';

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

export class TokenService {
  static generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  }

  static generateRefreshToken(user: User): string {
    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  }

  static async issueTokens(user: User) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Save refresh token to user (keep last 5 tokens for multi-device support)
    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 5) {
      user.refreshTokens.shift();
    }
    await userRepository.save(user);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      tokenType: 'Bearer',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async rotateRefreshToken(oldRefreshToken: string) {
    let payload: TokenPayload;
    try {
      payload = this.verifyRefreshToken(oldRefreshToken);
    } catch {
      throw new Error('Invalid or expired refresh token');
    }

    const user = await userRepository.findById(payload.id);
    if (!user || !user.isActive) {
      throw new Error('User not found or account deactivated');
    }

    // Verify token exists in user's active refresh tokens
    const tokenIndex = user.refreshTokens.indexOf(oldRefreshToken);
    if (tokenIndex === -1) {
      // Possible token reuse attack detected! Invalidate all refresh tokens for this user
      user.refreshTokens = [];
      await userRepository.save(user);
      throw new Error('Detected unauthorized token reuse. Please log in again.');
    }

    // Remove old refresh token and issue fresh pair
    user.refreshTokens.splice(tokenIndex, 1);
    return await this.issueTokens(user);
  }

  static async revokeRefreshToken(refreshToken: string) {
    try {
      const payload = this.verifyRefreshToken(refreshToken);
      const user = await userRepository.findById(payload.id);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
        await userRepository.save(user);
      }
    } catch {
      // If token expired, nothing to revoke
    }
  }
}
