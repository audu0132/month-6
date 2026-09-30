import { Request, Response } from 'express';
import { userProfileRepository } from '../models/userProfileModel';

export class UserController {
  static async getProfile(req: Request, res: Response) {
    try {
      const authId = (req.headers['x-user-id'] as string) || req.query.userId as string;
      if (!authId) {
        return res.status(400).json({ success: false, message: 'User identification header missing' });
      }

      const profile = await userProfileRepository.findByAuthId(authId);
      if (!profile) {
        return res.status(404).json({ success: false, message: 'Profile not found' });
      }

      res.status(200).json({ success: true, data: profile });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const authId = (req.headers['x-user-id'] as string) || req.body.authId;
      if (!authId) {
        return res.status(400).json({ success: false, message: 'Unauthorized or missing user identifier' });
      }

      const updated = await userProfileRepository.createOrUpdate({
        ...req.body,
        authId,
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const profile = await userProfileRepository.findByAuthId(id);
      if (!profile) {
        return res.status(404).json({ success: false, message: `User with id ${id} not found` });
      }
      res.status(200).json({ success: true, data: profile });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      const profiles = await userProfileRepository.getAll();
      res.status(200).json({
        success: true,
        count: profiles.length,
        data: profiles,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
