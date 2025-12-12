const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleProducts = [
  {
    name: 'Classic White T-Shirt',
    description: 'Premium quality cotton t-shirt with a comfortable fit. Perfect for everyday wear.',
    price: 1299,
    category: 'clothing',
    images: '/placeholder-product.jpg',
    inStock: true
  },
  {
    name: 'Black Denim Jacket',
    description: 'Stylish black denim jacket with a modern cut. Great for layering and casual outings.',
    price: 3499,
    category: 'clothing',
    images: '/placeholder-product.jpg',
    inStock: true
  },
  {
    name: 'Vintage Sneakers',
    description: 'Retro-style sneakers with comfortable cushioning. Perfect for streetwear looks.',
    price: 4599,
    category: 'shoes',
    images: '/placeholder-product.jpg',
    inStock: true
  },
  {
    name: 'Leather Crossbody Bag',
    description: 'Elegant leather crossbody bag with multiple compartments. Perfect for daily use.',
    price: 2299,
    category: 'bags',
    images: '/placeholder-product.jpg',
    inStock: true
  },
  {
    name: 'Oversized Hoodie',
    description: 'Comfortable oversized hoodie with a relaxed fit. Made from soft cotton blend.',
    price: 2799,
    category: 'clothing',
    images: '/placeholder-product.jpg',
    inStock: true
  },
  {
    name: 'Minimalist Watch',
    description: 'Clean and simple watch design. Perfect for any occasion.',
    price: 1899,
    category: 'accessories',
    images: '/placeholder-product.jpg',
    inStock: true
  },
  {
    name: 'Cargo Pants',
    description: 'Utility-style cargo pants with multiple pockets. Great for outdoor activities.',
    price: 3299,
    category: 'clothing',
    images: '/placeholder-product.jpg',
    inStock: true
  },
  {
    name: 'Canvas Backpack',
    description: 'Durable canvas backpack with laptop compartment. Ideal for work or travel.',
    price: 1999,
    category: 'bags',
    images: '/placeholder-product.jpg',
    inStock: true
  }
];

async function addSampleProducts() {
  try {
    console.log('Adding sample products...');
    
    for (const product of sampleProducts) {
      await prisma.product.create({
        data: product
      });
      console.log(`Added: ${product.name}`);
    }
    
    console.log('✅ Sample products added successfully!');
  } catch (error) {
    console.error('❌ Error adding sample products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleProducts();
