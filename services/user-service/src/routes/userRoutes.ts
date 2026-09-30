import express from 'express';
import { UserController } from '../controllers/userController';

const router = express.Router();

// User profile endpoints
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);

// User administration & inter-service lookup
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);

export default router;
