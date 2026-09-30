export class ProductServiceClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:4003';
  }

  async reserveInventory(items: Array<{ productId: string; quantity: number }>): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/products/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      const data: any = await response.json();
      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Product service rejected inventory reservation',
        };
      }

      return { success: true };
    } catch (err: any) {
      console.warn(`[ORDER-SERVICE] Warning: Product Service offline/unreachable (${err.message}). Proceeding with optimistic lock.`);
      return { success: true };
    }
  }
}

export const productClient = new ProductServiceClient();
