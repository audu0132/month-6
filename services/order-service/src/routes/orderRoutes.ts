import express from 'express';
import { OrderController } from '../controllers/orderController';

const router = express.Router();

router.post('/', OrderController.createOrder);
router.get('/', OrderController.listOrders);
router.get('/analytics/metrics', OrderController.getMetrics);
router.get('/:id', OrderController.getOrderById);
router.post('/:id/pay', OrderController.payOrder);
router.patch('/:id/status', OrderController.updateOrderStatus);

export default router;
