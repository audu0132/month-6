import express from 'express';
import { ProductController } from '../controllers/productController';

const router = express.Router();

router.get('/', ProductController.listProducts);
router.get('/categories', ProductController.getCategories);
router.get('/:id', ProductController.getProductById);
router.post('/', ProductController.createProduct);

// Inter-service reservation
router.post('/reserve', ProductController.reserveStock);

export default router;
