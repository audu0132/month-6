import { Request, Response } from 'express';
import { productRepository } from '../models/productModel';

export class ProductController {
  static async listProducts(req: Request, res: Response) {
    try {
      const { category, search, minPrice, maxPrice } = req.query;

      const products = await productRepository.getAll({
        category: category as string,
        search: search as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      });

      // HTTP Cache-Control header for microservice performance optimization
      res.setHeader('Cache-Control', 'public, max-age=60');

      res.status(200).json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await productRepository.getById(id);

      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${id} not found` });
      }

      res.status(200).json({ success: true, data: product });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await productRepository.getCategories();
      res.status(200).json({ success: true, data: categories });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Inter-service endpoint called by order-service to validate & deduct inventory
  static async reserveStock(req: Request, res: Response) {
    try {
      const { items } = req.body; // Array of { productId, quantity }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Items array is required' });
      }

      // Check all items availability first (atomic-check)
      for (const item of items) {
        const prod = await productRepository.getById(item.productId);
        if (!prod) {
          return res.status(404).json({
            success: false,
            message: `Product ${item.productId} not found during stock reservation`,
          });
        }
        if (prod.stock < item.quantity) {
          return res.status(409).json({
            success: false,
            message: `Insufficient inventory for ${prod.name}. Available: ${prod.stock}, required: ${item.quantity}`,
          });
        }
      }

      // Deduct stock
      const reserved = [];
      for (const item of items) {
        const result = await productRepository.reserveStock(item.productId, item.quantity);
        reserved.push(result.product);
      }

      res.status(200).json({
        success: true,
        message: 'Stock reserved successfully',
        data: reserved,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createProduct(req: Request, res: Response) {
    try {
      const { name, description, price, category, stock, sku, imageUrl, tags } = req.body;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const product = await productRepository.create({
        name,
        slug,
        description,
        price: Number(price),
        currency: 'USD',
        category,
        stock: Number(stock),
        sku: sku || `SKU-${Date.now()}`,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500',
        rating: 5.0,
        reviewCount: 0,
        tags: tags || [category.toLowerCase()],
        isActive: true,
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
