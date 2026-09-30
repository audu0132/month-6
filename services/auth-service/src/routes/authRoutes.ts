import express from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/authController';
import { validateInput, verifyToken, authorizeRoles } from '../middleware/security';

const router = express.Router();

// Input validation rules
const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email').isEmail().normalizeEmail().withMessage('A valid email address is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'customer'])
    .withMessage('Role must be admin, manager, or customer'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const refreshValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

// Public Routes
router.post('/register', validateInput(registerValidation), AuthController.register);
router.post('/login', validateInput(loginValidation), AuthController.login);
router.post('/refresh', validateInput(refreshValidation), AuthController.refresh);
router.post('/logout', AuthController.logout);
router.post('/verify-token', AuthController.verify);

// Protected Routes
router.get('/me', verifyToken, AuthController.me);
router.get('/users', verifyToken, authorizeRoles('admin', 'manager'), AuthController.listUsers);

export default router;
