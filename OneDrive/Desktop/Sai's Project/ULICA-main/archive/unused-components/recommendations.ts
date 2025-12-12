// Product recommendation engine
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  tags: string[];
  variants: Array<{
    id: string;
    options: {
      color: string;
      size: string;
    };
  }>;
}

export interface RecommendationContext {
  userId?: string;
  currentProductId?: string;
  recentlyViewed?: string[];
  cartItems?: string[];
  wishlistItems?: string[];
  purchaseHistory?: string[];
}

export class RecommendationEngine {
  private products: Product[] = [];
  private userBehavior: Map<string, any> = new Map();

  constructor(products: Product[]) {
    this.products = products;
  }

  /**
   * Get product recommendations based on context
   */
  getRecommendations(context: RecommendationContext, limit: number = 8): Product[] {
    const recommendations: Product[] = [];
    const seen = new Set<string>();

    // 1. Similar products (same category, similar price range)
    if (context.currentProductId) {
      const similarProducts = this.getSimilarProducts(context.currentProductId, limit);
      similarProducts.forEach(product => {
        if (!seen.has(product.id)) {
          recommendations.push(product);
          seen.add(product.id);
        }
      });
    }

    // 2. Category-based recommendations
    const categoryProducts = this.getCategoryRecommendations(context, limit);
    categoryProducts.forEach(product => {
      if (!seen.has(product.id) && recommendations.length < limit) {
        recommendations.push(product);
        seen.add(product.id);
      }
    });

    // 3. Price-based recommendations
    const priceProducts = this.getPriceBasedRecommendations(context, limit);
    priceProducts.forEach(product => {
      if (!seen.has(product.id) && recommendations.length < limit) {
        recommendations.push(product);
        seen.add(product.id);
      }
    });

    // 4. Popular products
    const popularProducts = this.getPopularProducts(limit);
    popularProducts.forEach(product => {
      if (!seen.has(product.id) && recommendations.length < limit) {
        recommendations.push(product);
        seen.add(product.id);
      }
    });

    return recommendations.slice(0, limit);
  }

  /**
   * Get similar products based on category and price
   */
  private getSimilarProducts(productId: string, limit: number): Product[] {
    const currentProduct = this.products.find(p => p.id === productId);
    if (!currentProduct) return [];

    const similarProducts = this.products
      .filter(p => 
        p.id !== productId && 
        p.category === currentProduct.category
      )
      .map(product => ({
        product,
        score: this.calculateSimilarityScore(currentProduct, product)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);

    return similarProducts;
  }

  /**
   * Get category-based recommendations
   */
  private getCategoryRecommendations(context: RecommendationContext, limit: number): Product[] {
    const categories = this.getUserPreferredCategories(context);
    
    const categoryProducts = this.products
      .filter(p => categories.includes(p.category))
      .map(product => ({
        product,
        score: this.calculateCategoryScore(product, context)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);

    return categoryProducts;
  }

  /**
   * Get price-based recommendations
   */
  private getPriceBasedRecommendations(context: RecommendationContext, limit: number): Product[] {
    const priceRange = this.getUserPriceRange(context);
    
    const priceProducts = this.products
      .filter(p => p.price >= priceRange.min && p.price <= priceRange.max)
      .map(product => ({
        product,
        score: this.calculatePriceScore(product, context)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);

    return priceProducts;
  }

  /**
   * Get popular products
   */
  private getPopularProducts(limit: number): Product[] {
    // In a real implementation, this would be based on actual sales data
    // For now, we'll use a simple popularity score based on price and category
    const popularProducts = this.products
      .map(product => ({
        product,
        score: this.calculatePopularityScore(product)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);

    return popularProducts;
  }

  /**
   * Calculate similarity score between two products
   */
  private calculateSimilarityScore(product1: Product, product2: Product): number {
    let score = 0;

    // Category match
    if (product1.category === product2.category) {
      score += 0.4;
    }

    // Price similarity (within 20% range)
    const priceDiff = Math.abs(product1.price - product2.price) / product1.price;
    if (priceDiff <= 0.2) {
      score += 0.3;
    }

    // Tag similarity
    const commonTags = product1.tags.filter(tag => product2.tags.includes(tag));
    score += (commonTags.length / Math.max(product1.tags.length, product2.tags.length)) * 0.3;

    return score;
  }

  /**
   * Calculate category score for a product
   */
  private calculateCategoryScore(product: Product, context: RecommendationContext): number {
    let score = 0;

    // Recent views in same category
    if (context.recentlyViewed) {
      const recentInCategory = context.recentlyViewed.filter(id => {
        const viewedProduct = this.products.find(p => p.id === id);
        return viewedProduct?.category === product.category;
      });
      score += recentInCategory.length * 0.1;
    }

    // Cart items in same category
    if (context.cartItems) {
      const cartInCategory = context.cartItems.filter(id => {
        const cartProduct = this.products.find(p => p.id === id);
        return cartProduct?.category === product.category;
      });
      score += cartInCategory.length * 0.2;
    }

    return Math.min(score, 1);
  }

  /**
   * Calculate price score for a product
   */
  private calculatePriceScore(product: Product, context: RecommendationContext): number {
    const priceRange = this.getUserPriceRange(context);
    const normalizedPrice = (product.price - priceRange.min) / (priceRange.max - priceRange.min);
    
    // Prefer products in the middle of the price range
    const distanceFromCenter = Math.abs(normalizedPrice - 0.5);
    return 1 - distanceFromCenter;
  }

  /**
   * Calculate popularity score for a product
   */
  private calculatePopularityScore(product: Product): number {
    let score = 0;

    // Discount factor (products with discounts are more popular)
    if (product.compareAtPrice && product.compareAtPrice > product.price) {
      const discount = (product.compareAtPrice - product.price) / product.compareAtPrice;
      score += discount * 0.3;
    }

    // Price factor (mid-range products are more popular)
    const avgPrice = this.products.reduce((sum, p) => sum + p.price, 0) / this.products.length;
    const priceRatio = product.price / avgPrice;
    if (priceRatio >= 0.5 && priceRatio <= 1.5) {
      score += 0.2;
    }

    // Category factor (some categories are more popular)
    const categoryCount = this.products.filter(p => p.category === product.category).length;
    const categoryPopularity = categoryCount / this.products.length;
    score += categoryPopularity * 0.5;

    return Math.min(score, 1);
  }

  /**
   * Get user's preferred categories
   */
  private getUserPreferredCategories(context: RecommendationContext): string[] {
    const categoryCounts = new Map<string, number>();

    // Count categories from recent views
    if (context.recentlyViewed) {
      context.recentlyViewed.forEach(id => {
        const product = this.products.find(p => p.id === id);
        if (product) {
          categoryCounts.set(product.category, (categoryCounts.get(product.category) || 0) + 1);
        }
      });
    }

    // Count categories from cart
    if (context.cartItems) {
      context.cartItems.forEach(id => {
        const product = this.products.find(p => p.id === id);
        if (product) {
          categoryCounts.set(product.category, (categoryCounts.get(product.category) || 0) + 2);
        }
      });
    }

    // Count categories from purchase history
    if (context.purchaseHistory) {
      context.purchaseHistory.forEach(id => {
        const product = this.products.find(p => p.id === id);
        if (product) {
          categoryCounts.set(product.category, (categoryCounts.get(product.category) || 0) + 3);
        }
      });
    }

    // Return top categories
    return Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
  }

  /**
   * Get user's price range
   */
  private getUserPriceRange(context: RecommendationContext): { min: number; max: number } {
    const prices: number[] = [];

    // Add prices from recent views
    if (context.recentlyViewed) {
      context.recentlyViewed.forEach(id => {
        const product = this.products.find(p => p.id === id);
        if (product) prices.push(product.price);
      });
    }

    // Add prices from cart
    if (context.cartItems) {
      context.cartItems.forEach(id => {
        const product = this.products.find(p => p.id === id);
        if (product) prices.push(product.price);
      });
    }

    if (prices.length === 0) {
      // Default price range
      return { min: 0, max: 10000 };
    }

    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.max(0, avgPrice * 0.5);
    const maxPrice = avgPrice * 2;

    return { min: minPrice, max: maxPrice };
  }
}

// Utility functions
export function createRecommendationEngine(products: Product[]): RecommendationEngine {
  return new RecommendationEngine(products);
}

export function getRecommendationContext(
  userId?: string,
  currentProductId?: string,
  recentlyViewed?: string[],
  cartItems?: string[],
  wishlistItems?: string[],
  purchaseHistory?: string[]
): RecommendationContext {
  return {
    userId,
    currentProductId,
    recentlyViewed,
    cartItems,
    wishlistItems,
    purchaseHistory
  };
}
