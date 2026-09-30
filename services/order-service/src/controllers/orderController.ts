import { Request, Response } from 'express';
import { orderRepository, OrderStatus } from '../models/orderModel';
import { productClient } from '../services/productClient';

export class OrderController {
  static async createOrder(req: Request, res: Response) {
    try {
      const {
        items,
        shippingAddress,
        customerName = 'Enterprise Customer',
        customerEmail = 'customer@enterprise.io',
      } = req.body;

      const userId = (req.headers['x-user-id'] as string) || req.body.userId || 'usr_cust_003';

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
      }

      // Step 1: Inter-service call to Product Service to check & reserve stock
      const reservation = await productClient.reserveInventory(
        items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      );

      if (!reservation.success) {
        return res.status(409).json({
          success: false,
          message: reservation.message,
        });
      }

      // Step 2: Compute financial totals
      const subtotal = items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
      const tax = Number((subtotal * 0.08).toFixed(2));
      const shippingFee = subtotal > 100 ? 0 : 15.0;
      const totalAmount = Number((subtotal + tax + shippingFee).toFixed(2));

      // Step 3: Persist Order
      const newOrder = await orderRepository.create({
        userId,
        customerName,
        customerEmail,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          total: Number((i.price * i.quantity).toFixed(2)),
        })),
        subtotal: Number(subtotal.toFixed(2)),
        tax,
        shippingFee,
        totalAmount,
        currency: 'USD',
        status: 'PENDING',
        shippingAddress: shippingAddress || {
          street: '100 Silicon Way',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94107',
          country: 'USA',
        },
      });

      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: newOrder,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async listOrders(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const userRole = req.headers['x-user-role'] as string;
      const { status } = req.query;

      // Role-based visibility: Customers only see their own orders, Admins/Managers see all
      const filterUserId = userRole === 'customer' ? userId : (req.query.userId as string);

      const orders = await orderRepository.getAll({
        userId: filterUserId,
        status: status as OrderStatus,
      });

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await orderRepository.getById(id);

      if (!order) {
        return res.status(404).json({ success: false, message: `Order ${id} not found` });
      }

      res.status(200).json({ success: true, data: order });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async payOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await orderRepository.getById(id);

      if (!order) {
        return res.status(404).json({ success: false, message: `Order ${id} not found` });
      }

      if (order.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: `Cannot pay for order with status '${order.status}'`,
        });
      }

      // Simulate payment gateway processing
      order.paymentDetails = {
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        provider: 'Stripe Enterprise Checkout',
        paidAt: new Date().toISOString(),
        status: 'SUCCESS',
      };

      const updated = await orderRepository.updateStatus(id, 'PAID', 'Payment verified and captured');

      res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
      }

      const updated = await orderRepository.updateStatus(id, status as OrderStatus, note);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      res.status(200).json({
        success: true,
        message: `Order status transitioned to ${status}`,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getMetrics(req: Request, res: Response) {
    try {
      const metrics = await orderRepository.getMetrics();
      res.status(200).json({ success: true, data: metrics });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
