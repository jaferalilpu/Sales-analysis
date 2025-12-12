import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ulica.com' },
    update: {},
    create: {
      email: 'admin@ulica.com',
      password: adminPassword,
      name: 'ULICA Admin',
      role: 'admin',
      isActive: true
    }
  });
  console.log('✅ Admin user created:', admin.email);

  // Create sample customer
  const customerPassword = await bcrypt.hash('customer123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: customerPassword,
      name: 'John Doe',
      phone: '+919876543210',
      role: 'customer',
      isActive: true
    }
  });
  console.log('✅ Sample customer created:', customer.email);

  // Create product categories
  // const categories = [
  //   'Hoodies',
  //   'T-Shirts',
  //   'Jackets',
  //   'Pants',
  //   'Accessories'
  // ];

  // Create sample products
  const products = [
    {
      title: 'Wilderness Drop Hoodie',
      slug: 'wilderness-drop-hoodie',
      description: 'Premium quality hoodie with wilderness-inspired design. Made from 100% cotton blend for ultimate comfort.',
      shortDescription: 'Premium wilderness-inspired hoodie',
      category: 'Hoodies',
      tags: 'hoodie,wilderness,premium,streetwear',
      status: 'published',
      featured: true,
      variants: [
        {
          sku: 'WD-HOODIE-S-BLK',
          price: 2999, // ₹29.99
          comparePrice: 3999, // ₹39.99
          stockQty: 50,
          attributes: JSON.stringify({ size: 'S', color: 'Black' }),
          weight: 600
        },
        {
          sku: 'WD-HOODIE-M-BLK',
          price: 2999,
          comparePrice: 3999,
          stockQty: 75,
          attributes: JSON.stringify({ size: 'M', color: 'Black' }),
          weight: 650
        },
        {
          sku: 'WD-HOODIE-L-BLK',
          price: 2999,
          comparePrice: 3999,
          stockQty: 60,
          attributes: JSON.stringify({ size: 'L', color: 'Black' }),
          weight: 700
        },
        {
          sku: 'WD-HOODIE-XL-BLK',
          price: 2999,
          comparePrice: 3999,
          stockQty: 40,
          attributes: JSON.stringify({ size: 'XL', color: 'Black' }),
          weight: 750
        }
      ],
      images: [
        {
          url: '/27546740_t32h_phbt_211202.svg',
          altText: 'Wilderness Drop Hoodie - Black',
          position: 0,
          isPrimary: true
        },
        {
          url: '/21303405_bvny_bp58_210816.svg',
          altText: 'Wilderness Drop Hoodie - Back View',
          position: 1,
          isPrimary: false
        }
      ]
    },
    {
      title: 'Urban Explorer T-Shirt',
      slug: 'urban-explorer-t-shirt',
      description: 'Comfortable and stylish t-shirt perfect for urban adventures. Soft cotton fabric with modern fit.',
      shortDescription: 'Comfortable urban-style t-shirt',
      category: 'T-Shirts',
      tags: 'tshirt,urban,comfortable,cotton',
      status: 'published',
      featured: false,
      variants: [
        {
          sku: 'UE-TS-S-WHT',
          price: 1299,
          comparePrice: 1799,
          stockQty: 100,
          attributes: JSON.stringify({ size: 'S', color: 'White' }),
          weight: 200
        },
        {
          sku: 'UE-TS-M-WHT',
          price: 1299,
          comparePrice: 1799,
          stockQty: 120,
          attributes: JSON.stringify({ size: 'M', color: 'White' }),
          weight: 220
        },
        {
          sku: 'UE-TS-L-WHT',
          price: 1299,
          comparePrice: 1799,
          stockQty: 90,
          attributes: JSON.stringify({ size: 'L', color: 'White' }),
          weight: 240
        }
      ],
      images: [
        {
          url: '/placeholder-product.jpg',
          altText: 'Urban Explorer T-Shirt - White',
          position: 0,
          isPrimary: true
        }
      ]
    },
    {
      title: 'Mountain Peak Jacket',
      slug: 'mountain-peak-jacket',
      description: 'Weather-resistant jacket designed for mountain adventures. Features water-resistant coating and multiple pockets.',
      shortDescription: 'Weather-resistant mountain jacket',
      category: 'Jackets',
      tags: 'jacket,mountain,waterproof,adventure',
      status: 'published',
      featured: true,
      variants: [
        {
          sku: 'MP-JKT-M-GRY',
          price: 5999,
          comparePrice: 7999,
          stockQty: 30,
          attributes: JSON.stringify({ size: 'M', color: 'Gray' }),
          weight: 800
        },
        {
          sku: 'MP-JKT-L-GRY',
          price: 5999,
          comparePrice: 7999,
          stockQty: 25,
          attributes: JSON.stringify({ size: 'L', color: 'Gray' }),
          weight: 850
        },
        {
          sku: 'MP-JKT-XL-GRY',
          price: 5999,
          comparePrice: 7999,
          stockQty: 20,
          attributes: JSON.stringify({ size: 'XL', color: 'Gray' }),
          weight: 900
        }
      ],
      images: [
        {
          url: '/placeholder-product.jpg',
          altText: 'Mountain Peak Jacket - Gray',
          position: 0,
          isPrimary: true
        }
      ]
    },
    {
      title: 'Street Denim Pants',
      slug: 'street-denim-pants',
      description: 'Classic streetwear denim pants with modern fit. Perfect for casual urban styling.',
      shortDescription: 'Classic streetwear denim pants',
      category: 'Pants',
      tags: 'pants,denim,streetwear,casual',
      status: 'published',
      featured: false,
      variants: [
        {
          sku: 'SD-DENIM-32-BLU',
          price: 2499,
          comparePrice: 3499,
          stockQty: 80,
          attributes: JSON.stringify({ size: '32', color: 'Blue' }),
          weight: 500
        },
        {
          sku: 'SD-DENIM-34-BLU',
          price: 2499,
          comparePrice: 3499,
          stockQty: 75,
          attributes: JSON.stringify({ size: '34', color: 'Blue' }),
          weight: 520
        },
        {
          sku: 'SD-DENIM-36-BLU',
          price: 2499,
          comparePrice: 3499,
          stockQty: 60,
          attributes: JSON.stringify({ size: '36', color: 'Blue' }),
          weight: 540
        }
      ],
      images: [
        {
          url: '/placeholder-product.jpg',
          altText: 'Street Denim Pants - Blue',
          position: 0,
          isPrimary: true
        }
      ]
    },
    {
      title: 'Adventure Cap',
      slug: 'adventure-cap',
      description: 'Adjustable adventure cap with breathable fabric. Perfect for outdoor activities.',
      shortDescription: 'Breathable adventure cap',
      category: 'Accessories',
      tags: 'cap,accessory,outdoor,breathable',
      status: 'published',
      featured: false,
      variants: [
        {
          sku: 'ADV-CAP-ONE-BLK',
          price: 799,
          comparePrice: 1199,
          stockQty: 150,
          attributes: JSON.stringify({ size: 'One Size', color: 'Black' }),
          weight: 100
        },
        {
          sku: 'ADV-CAP-ONE-NAV',
          price: 799,
          comparePrice: 1199,
          stockQty: 120,
          attributes: JSON.stringify({ size: 'One Size', color: 'Navy' }),
          weight: 100
        }
      ],
      images: [
        {
          url: '/placeholder-product.jpg',
          altText: 'Adventure Cap - Black',
          position: 0,
          isPrimary: true
        }
      ]
    }
  ];

  // Create products with variants and images
  for (const productData of products) {
    const { variants, images, status, featured, category, tags, ...productInfo } = productData;
    
    // Find or create category
    let categoryRecord = await prisma.category.findFirst({
      where: { name: category }
    });
    
    if (!categoryRecord) {
      categoryRecord = await prisma.category.create({
        data: {
          name: category,
          slug: category.toLowerCase().replace(/\s+/g, '-'),
          description: `${category} products`
        }
      });
    }
    
    // Get minimum variant price for product price
    const minVariantPrice = variants.length > 0 ? Math.min(...variants.map((v: { price: number }) => v.price)) : 0;
    // Get maximum variant comparePrice for product compareAtPrice
    const maxComparePrice = variants.length > 0 
      ? Math.max(...variants.map((v: { comparePrice?: number }) => v.comparePrice || 0).filter((p: number) => p > 0)) 
      : null;
    
    const product = await prisma.product.upsert({
      where: { slug: productInfo.slug },
      update: {
        price: minVariantPrice,
        compareAtPrice: maxComparePrice ?? null,
      },
      create: {
        ...productInfo,
        price: minVariantPrice,
        compareAtPrice: maxComparePrice ?? null,
        categoryId: categoryRecord.id,
        tags: typeof tags === 'string' ? tags.split(',') : tags || [],
        isActive: status === 'published',
        isFeatured: featured || false
      }
    });

    // Create variants
    for (const variantData of variants) {
      const { comparePrice, attributes, ...variantFields } = variantData;
      await prisma.productVariant.upsert({
        where: { sku: variantData.sku },
        update: {
          compareAtPrice: comparePrice ?? null,
          price: variantFields.price,
        },
        create: {
          ...variantFields,
          title: `${product.title} - ${attributes ? JSON.parse(attributes).size || '' : ''}`,
          compareAtPrice: comparePrice ?? null,
          options: attributes ? JSON.parse(attributes) : {},
          productId: product.id
        }
      });
    }

    // Create images
    for (const imageData of images) {
      await prisma.productImage.upsert({
        where: { 
          id: `${product.id}-${imageData.position}` 
        },
        update: {},
        create: {
          ...imageData,
          productId: product.id
        }
      });
    }

    console.log('✅ Product created:', product.title);
  }

  // Create sample coupons
  const coupons = [
    {
      code: 'WELCOME10',
      type: 'percent',
      value: 10,
      minOrderValue: 1000,
      usageLimit: 100,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    },
    {
      code: 'FREESHIP',
      type: 'free_shipping',
      value: 0,
      minOrderValue: 2000,
      usageLimit: 50,
      isActive: true,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days from now
    },
    {
      code: 'SAVE500',
      type: 'flat',
      value: 50000, // ₹500 in paise
      minOrderValue: 3000,
      usageLimit: 25,
      isActive: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    }
  ];

  for (const couponData of coupons) {
    const { minOrderValue, code, type, value, usageLimit, isActive, expiresAt } = couponData;
    await prisma.coupon.upsert({
      where: { code },
      update: {},
      create: {
        code,
        name: code, // Use code as name if name not provided
        type,
        value,
        minimumAmount: minOrderValue,
        usageLimit,
        isActive,
        expiresAt
      }
    });
    console.log('✅ Coupon created:', couponData.code);
  }

  // Create sample reviews
  const wildernessHoodie = await prisma.product.findUnique({
    where: { slug: 'wilderness-drop-hoodie' }
  });

  if (wildernessHoodie) {
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: customer.id,
        productId: wildernessHoodie.id
      }
    });
    
    if (!existingReview) {
      await prisma.review.create({
        data: {
          userId: customer.id,
          productId: wildernessHoodie.id,
          rating: 5,
          title: 'Amazing quality!',
          comment: 'The hoodie is incredibly comfortable and the design is perfect. Highly recommend!',
          isApproved: true
        }
      });
    }
    console.log('✅ Sample review created');
  }

  // Create sample addresses
  await prisma.address.upsert({
    where: { id: 'sample-address-1' },
    update: {},
    create: {
      id: 'sample-address-1',
      userId: customer.id,
      type: 'shipping',
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main Street',
      address2: 'Apt 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
      phone: '+919876543210',
      isDefault: true
    }
  });
  console.log('✅ Sample address created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Sample Accounts:');
  console.log('Admin: admin@ulica.com / admin123');
  console.log('Customer: customer@example.com / customer123');
  console.log('\n🎫 Sample Coupons:');
  console.log('- WELCOME10 (10% off, min ₹1000)');
  console.log('- FREESHIP (Free shipping, min ₹2000)');
  console.log('- SAVE500 (₹500 off, min ₹3000)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
