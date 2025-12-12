const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleProducts = [
  {
    title: 'Classic Black Hoodie',
    slug: 'classic-black-hoodie',
    description: 'Premium quality black hoodie with comfortable fit. Made from 100% cotton blend for ultimate comfort and durability. Perfect for casual wear and street style.',
    shortDescription: 'Premium black hoodie with comfortable fit',
    price: 2499,
    compareAtPrice: 3499,
    categoryId: null, // Will need to create or find category
    sku: 'CBH-001',
    isActive: true,
    isFeatured: true,
    tags: ['hoodie', 'black', 'casual', 'streetwear'],
    variants: [
      {
        title: 'S / Black',
        price: 2499,
        compareAtPrice: 3499,
        stockQty: 25,
        sku: 'CBH-001-S-BLK',
        options: { Size: 'S', Color: 'Black' }
      },
      {
        title: 'M / Black',
        price: 2499,
        compareAtPrice: 3499,
        stockQty: 30,
        sku: 'CBH-001-M-BLK',
        options: { Size: 'M', Color: 'Black' }
      },
      {
        title: 'L / Black',
        price: 2499,
        compareAtPrice: 3499,
        stockQty: 28,
        sku: 'CBH-001-L-BLK',
        options: { Size: 'L', Color: 'Black' }
      },
      {
        title: 'XL / Black',
        price: 2499,
        compareAtPrice: 3499,
        stockQty: 20,
        sku: 'CBH-001-XL-BLK',
        options: { Size: 'XL', Color: 'Black' }
      }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
        alt: 'Classic Black Hoodie',
        isPrimary: true
      },
      {
        url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
        alt: 'Classic Black Hoodie - Side View',
        isPrimary: false
      }
    ]
  },
  {
    title: 'White Premium T-Shirt',
    slug: 'white-premium-t-shirt',
    description: 'Soft and breathable white t-shirt made from premium cotton. Perfect for everyday wear with a modern fit. Easy to style and maintain.',
    shortDescription: 'Soft premium white cotton t-shirt',
    price: 1299,
    compareAtPrice: 1799,
    categoryId: null,
    sku: 'WPT-002',
    isActive: true,
    isFeatured: false,
    tags: ['t-shirt', 'white', 'cotton', 'casual'],
    variants: [
      {
        title: 'S / White',
        price: 1299,
        compareAtPrice: 1799,
        stockQty: 40,
        sku: 'WPT-002-S-WHT',
        options: { Size: 'S', Color: 'White' }
      },
      {
        title: 'M / White',
        price: 1299,
        compareAtPrice: 1799,
        stockQty: 50,
        sku: 'WPT-002-M-WHT',
        options: { Size: 'M', Color: 'White' }
      },
      {
        title: 'L / White',
        price: 1299,
        compareAtPrice: 1799,
        stockQty: 45,
        sku: 'WPT-002-L-WHT',
        options: { Size: 'L', Color: 'White' }
      },
      {
        title: 'XL / White',
        price: 1299,
        compareAtPrice: 1799,
        stockQty: 35,
        sku: 'WPT-002-XL-WHT',
        options: { Size: 'XL', Color: 'White' }
      }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        alt: 'White Premium T-Shirt',
        isPrimary: true
      }
    ]
  },
  {
    title: 'Navy Blue Denim Jacket',
    slug: 'navy-blue-denim-jacket',
    description: 'Classic navy blue denim jacket with modern fit. Perfect for layering and adding style to any outfit. Made from high-quality denim fabric.',
    shortDescription: 'Classic navy denim jacket with modern fit',
    price: 3999,
    compareAtPrice: 4999,
    categoryId: null,
    sku: 'NBDJ-003',
    isActive: true,
    isFeatured: true,
    tags: ['jacket', 'denim', 'navy', 'casual'],
    variants: [
      {
        title: 'M / Navy',
        price: 3999,
        compareAtPrice: 4999,
        stockQty: 15,
        sku: 'NBDJ-003-M-NAV',
        options: { Size: 'M', Color: 'Navy' }
      },
      {
        title: 'L / Navy',
        price: 3999,
        compareAtPrice: 4999,
        stockQty: 18,
        sku: 'NBDJ-003-L-NAV',
        options: { Size: 'L', Color: 'Navy' }
      },
      {
        title: 'XL / Navy',
        price: 3999,
        compareAtPrice: 4999,
        stockQty: 12,
        sku: 'NBDJ-003-XL-NAV',
        options: { Size: 'XL', Color: 'Navy' }
      }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
        alt: 'Navy Blue Denim Jacket',
        isPrimary: true
      }
    ]
  },
  {
    title: 'Gray Cargo Pants',
    slug: 'gray-cargo-pants',
    description: 'Utility-style gray cargo pants with multiple pockets. Made from durable cotton blend fabric. Perfect for outdoor activities and casual wear.',
    shortDescription: 'Utility gray cargo pants with multiple pockets',
    price: 3299,
    compareAtPrice: 4299,
    categoryId: null,
    sku: 'GCP-004',
    isActive: true,
    isFeatured: false,
    tags: ['pants', 'cargo', 'gray', 'utility'],
    variants: [
      {
        title: 'M / Gray',
        price: 3299,
        compareAtPrice: 4299,
        stockQty: 20,
        sku: 'GCP-004-M-GRY',
        options: { Size: 'M', Color: 'Gray' }
      },
      {
        title: 'L / Gray',
        price: 3299,
        compareAtPrice: 4299,
        stockQty: 22,
        sku: 'GCP-004-L-GRY',
        options: { Size: 'L', Color: 'Gray' }
      },
      {
        title: 'XL / Gray',
        price: 3299,
        compareAtPrice: 4299,
        stockQty: 18,
        sku: 'GCP-004-XL-GRY',
        options: { Size: 'XL', Color: 'Gray' }
      }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
        alt: 'Gray Cargo Pants',
        isPrimary: true
      }
    ]
  },
  {
    title: 'Red Streetwear Sneakers',
    slug: 'red-streetwear-sneakers',
    description: 'Bold red sneakers with comfortable cushioning and modern design. Perfect for streetwear looks and everyday comfort. High-quality materials for durability.',
    shortDescription: 'Bold red streetwear sneakers with comfort',
    price: 4599,
    compareAtPrice: 5999,
    categoryId: null,
    sku: 'RSS-005',
    isActive: true,
    isFeatured: true,
    tags: ['sneakers', 'red', 'streetwear', 'shoes'],
    variants: [
      {
        title: '8 / Red',
        price: 4599,
        compareAtPrice: 5999,
        stockQty: 10,
        sku: 'RSS-005-8-RED',
        options: { Size: '8', Color: 'Red' }
      },
      {
        title: '9 / Red',
        price: 4599,
        compareAtPrice: 5999,
        stockQty: 12,
        sku: 'RSS-005-9-RED',
        options: { Size: '9', Color: 'Red' }
      },
      {
        title: '10 / Red',
        price: 4599,
        compareAtPrice: 5999,
        stockQty: 15,
        sku: 'RSS-005-10-RED',
        options: { Size: '10', Color: 'Red' }
      },
      {
        title: '11 / Red',
        price: 4599,
        compareAtPrice: 5999,
        stockQty: 8,
        sku: 'RSS-005-11-RED',
        options: { Size: '11', Color: 'Red' }
      }
    ],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        alt: 'Red Streetwear Sneakers',
        isPrimary: true
      }
    ]
  }
];

async function addSampleProducts() {
  try {
    console.log('🚀 Starting to add 5 sample products...\n');

    // First, try to find or create a default category
    let defaultCategory;
    try {
      defaultCategory = await prisma.category.findFirst({
        where: { name: 'Clothing' }
      });
      
      if (!defaultCategory) {
        defaultCategory = await prisma.category.create({
          data: {
            name: 'Clothing',
            slug: 'clothing',
            description: 'Default clothing category'
          }
        });
        console.log('✅ Created default category: Clothing');
      }
    } catch (error) {
      console.log('⚠️  Category not found, products will be created without category');
      defaultCategory = null;
    }

    for (let i = 0; i < sampleProducts.length; i++) {
      const productData = sampleProducts[i];
      console.log(`\n📦 Creating product ${i + 1}/5: ${productData.title}`);

      // Create product images first
      const productImages = await Promise.all(
        productData.images.map((img, idx) =>
          prisma.productImage.create({
            data: {
              productId: '', // Will update after product creation
              url: img.url,
              alt: img.alt || productData.title,
              isPrimary: img.isPrimary || idx === 0,
              sortOrder: idx
            }
          }).catch(() => null)
        )
      );

      // Create product
      const product = await prisma.product.create({
        data: {
          title: productData.title,
          slug: productData.slug,
          description: productData.description,
          shortDescription: productData.shortDescription,
          price: productData.price,
          compareAtPrice: productData.compareAtPrice,
          categoryId: defaultCategory?.id || productData.categoryId || '',
          sku: productData.sku,
          isActive: productData.isActive,
          isFeatured: productData.isFeatured,
          tags: productData.tags,
          images: {
            create: productData.images.map((img, idx) => ({
              url: img.url,
              alt: img.alt || productData.title,
              isPrimary: img.isPrimary || idx === 0,
              sortOrder: idx
            }))
          },
          variants: {
            create: productData.variants.map((variant) => ({
              title: variant.title,
              price: variant.price,
              compareAtPrice: variant.compareAtPrice,
              stockQty: variant.stockQty,
              sku: variant.sku,
              options: variant.options,
              isActive: true
            }))
          }
        }
      });

      console.log(`   ✅ Created: ${product.title}`);
      console.log(`   📸 Images: ${productData.images.length}`);
      console.log(`   🎨 Variants: ${productData.variants.length}`);
    }

    console.log('\n✅ Successfully added 5 sample products!');
    console.log('\n📊 Summary:');
    console.log(`   - Total products: ${sampleProducts.length}`);
    console.log(`   - Total variants: ${sampleProducts.reduce((sum, p) => sum + p.variants.length, 0)}`);
    console.log(`   - Total images: ${sampleProducts.reduce((sum, p) => sum + p.images.length, 0)}`);
  } catch (error) {
    console.error('❌ Error adding sample products:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addSampleProducts()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

