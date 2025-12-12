import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@ulica.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'Admin User';
  
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedAdminPassword,
      name: adminName,
      role: 'admin',
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create test customer
  const customerPassword = await bcrypt.hash('customer123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@ulica.com' },
    update: {},
    create: {
      email: 'customer@ulica.com',
      password: customerPassword,
      name: 'Test Customer',
      phone: '+919876543210',
      role: 'customer',
      isActive: true,
    },
  });

  console.log('✅ Test customer created:', customer.email);

  // Create sample products
  const products = [
    {
      title: 'ULICA Black Hoodie',
      slug: 'ulica-black-hoodie',
      description: 'Premium streetwear hoodie made with the finest materials. Perfect for the urban lifestyle.',
      shortDescription: 'Premium streetwear hoodie',
      category: 'Hoodies',
      tags: 'hoodie,black,streetwear,premium',
      status: 'published',
      featured: true,
      variants: [
        {
          sku: 'UH-001-S',
          price: 299900, // ₹2999
          comparePrice: 399900, // ₹3999
          costPrice: 199900, // ₹1999
          stockQty: 50,
          attributes: JSON.stringify({ size: 'S', color: 'Black' }),
          weight: 800,
        },
        {
          sku: 'UH-001-M',
          price: 299900,
          comparePrice: 399900,
          costPrice: 199900,
          stockQty: 75,
          attributes: JSON.stringify({ size: 'M', color: 'Black' }),
          weight: 850,
        },
        {
          sku: 'UH-001-L',
          price: 299900,
          comparePrice: 399900,
          costPrice: 199900,
          stockQty: 60,
          attributes: JSON.stringify({ size: 'L', color: 'Black' }),
          weight: 900,
        },
        {
          sku: 'UH-001-XL',
          price: 299900,
          comparePrice: 399900,
          costPrice: 199900,
          stockQty: 40,
          attributes: JSON.stringify({ size: 'XL', color: 'Black' }),
          weight: 950,
        },
      ],
      images: [
        {
          url: '/images/products/ulica-black-hoodie-1.jpg',
          altText: 'ULICA Black Hoodie Front View',
          position: 0,
          isPrimary: true,
        },
        {
          url: '/images/products/ulica-black-hoodie-2.jpg',
          altText: 'ULICA Black Hoodie Back View',
          position: 1,
          isPrimary: false,
        },
        {
          url: '/images/products/ulica-black-hoodie-3.jpg',
          altText: 'ULICA Black Hoodie Detail View',
          position: 2,
          isPrimary: false,
        },
      ],
    },
    {
      title: 'ULICA White T-Shirt',
      slug: 'ulica-white-tshirt',
      description: 'Classic white t-shirt with ULICA branding. Made from 100% organic cotton for ultimate comfort.',
      shortDescription: 'Classic white t-shirt',
      category: 'T-Shirts',
      tags: 'tshirt,white,cotton,basic',
      status: 'published',
      featured: true,
      variants: [
        {
          sku: 'UT-001-S',
          price: 129900, // ₹1299
          comparePrice: 179900, // ₹1799
          costPrice: 89900, // ₹899
          stockQty: 100,
          attributes: JSON.stringify({ size: 'S', color: 'White' }),
          weight: 200,
        },
        {
          sku: 'UT-001-M',
          price: 129900,
          comparePrice: 179900,
          costPrice: 89900,
          stockQty: 120,
          attributes: JSON.stringify({ size: 'M', color: 'White' }),
          weight: 220,
        },
        {
          sku: 'UT-001-L',
          price: 129900,
          comparePrice: 179900,
          costPrice: 89900,
          stockQty: 110,
          attributes: JSON.stringify({ size: 'L', color: 'White' }),
          weight: 240,
        },
      ],
      images: [
        {
          url: '/images/products/ulica-white-tshirt-1.jpg',
          altText: 'ULICA White T-Shirt Front View',
          position: 0,
          isPrimary: true,
        },
        {
          url: '/images/products/ulica-white-tshirt-2.jpg',
          altText: 'ULICA White T-Shirt Back View',
          position: 1,
          isPrimary: false,
        },
      ],
    },
    {
      title: 'ULICA Cargo Pants',
      slug: 'ulica-cargo-pants',
      description: 'Functional cargo pants with multiple pockets. Perfect for the urban explorer.',
      shortDescription: 'Functional cargo pants',
      category: 'Pants',
      tags: 'pants,cargo,functional,urban',
      status: 'published',
      featured: false,
      variants: [
        {
          sku: 'UP-001-30',
          price: 399900, // ₹3999
          comparePrice: 499900, // ₹4999
          costPrice: 299900, // ₹2999
          stockQty: 30,
          attributes: JSON.stringify({ size: '30', color: 'Olive' }),
          weight: 600,
        },
        {
          sku: 'UP-001-32',
          price: 399900,
          comparePrice: 499900,
          costPrice: 299900,
          stockQty: 35,
          attributes: JSON.stringify({ size: '32', color: 'Olive' }),
          weight: 650,
        },
        {
          sku: 'UP-001-34',
          price: 399900,
          comparePrice: 499900,
          costPrice: 299900,
          stockQty: 40,
          attributes: JSON.stringify({ size: '34', color: 'Olive' }),
          weight: 700,
        },
      ],
      images: [
        {
          url: '/images/products/ulica-cargo-pants-1.jpg',
          altText: 'ULICA Cargo Pants Front View',
          position: 0,
          isPrimary: true,
        },
        {
          url: '/images/products/ulica-cargo-pants-2.jpg',
          altText: 'ULICA Cargo Pants Side View',
          position: 1,
          isPrimary: false,
        },
      ],
    },
    {
      title: 'ULICA Limited Edition Cap',
      slug: 'ulica-limited-cap',
      description: 'Limited edition snapback cap with exclusive ULICA embroidery. Only 100 pieces available worldwide.',
      shortDescription: 'Limited edition snapback cap',
      category: 'Accessories',
      tags: 'cap,limited,exclusive,snapback',
      status: 'published',
      featured: true,
      variants: [
        {
          sku: 'UC-001-OS',
          price: 199900, // ₹1999
          comparePrice: 249900, // ₹2499
          costPrice: 149900, // ₹1499
          stockQty: 25,
          attributes: JSON.stringify({ size: 'One Size', color: 'Black' }),
          weight: 150,
        },
      ],
      images: [
        {
          url: '/images/products/ulica-limited-cap-1.jpg',
          altText: 'ULICA Limited Edition Cap Front View',
          position: 0,
          isPrimary: true,
        },
        {
          url: '/images/products/ulica-limited-cap-2.jpg',
          altText: 'ULICA Limited Edition Cap Side View',
          position: 1,
          isPrimary: false,
        },
      ],
    },
  ];

  for (const productData of products) {
    const { variants, images, ...productInfo } = productData;
    
    const product = await prisma.product.upsert({
      where: { slug: productInfo.slug },
      update: {},
      create: {
        ...productInfo,
        variants: {
          create: variants.map(variant => ({
            ...variant,
            isActive: true,
          })),
        },
        images: {
          create: images,
        },
      },
    });

    console.log(`✅ Product created: ${product.title}`);
  }

  // Create sample coupons
  const coupons = [
    {
      code: 'WELCOME10',
      type: 'percent',
      value: 10,
      minOrderValue: 200000, // ₹2000
      usageLimit: 1000,
      isActive: true,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    {
      code: 'FIRSTORDER',
      type: 'flat',
      value: 50000, // ₹500
      minOrderValue: 100000, // ₹1000
      usageLimit: 500,
      isActive: true,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    },
    {
      code: 'FREESHIP',
      type: 'free_shipping',
      value: 0,
      minOrderValue: 100000, // ₹1000
      usageLimit: null,
      isActive: true,
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {},
      create: coupon,
    });
  }

  console.log('✅ Coupons created');

  // Create sample reviews
  const reviews = [
    {
      userId: customer.id,
      productId: (await prisma.product.findUnique({ where: { slug: 'ulica-black-hoodie' } }))?.id || '',
      rating: 5,
      title: 'Amazing quality!',
      comment: 'Love this hoodie! The quality is exceptional and it fits perfectly. Highly recommended!',
      isVerified: true,
      isApproved: true,
    },
    {
      userId: customer.id,
      productId: (await prisma.product.findUnique({ where: { slug: 'ulica-white-tshirt' } }))?.id || '',
      rating: 4,
      title: 'Great basic tee',
      comment: 'Perfect white t-shirt. Good quality cotton and comfortable fit. Will definitely buy more.',
      isVerified: true,
      isApproved: true,
    },
  ];

  for (const review of reviews) {
    if (review.productId) {
      await prisma.review.upsert({
        where: {
          userId_productId: {
            userId: review.userId,
            productId: review.productId,
          },
        },
        update: {},
        create: review,
      });
    }
  }

  console.log('✅ Reviews created');

  // Create sample addresses for customer
  const addresses = [
    {
      userId: customer.id,
      type: 'shipping',
      firstName: 'Test',
      lastName: 'Customer',
      line1: '123 Main Street',
      line2: 'Apartment 4B',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
      phone: '+919876543210',
      isDefault: true,
    },
    {
      userId: customer.id,
      type: 'billing',
      firstName: 'Test',
      lastName: 'Customer',
      line1: '456 Business Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400002',
      country: 'India',
      phone: '+919876543210',
      isDefault: true,
    },
  ];

  for (const address of addresses) {
    await prisma.address.create({
      data: address,
    });
  }

  console.log('✅ Addresses created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
  console.log('Customer: customer@ulica.com / customer123');
  console.log('\n🎫 Test Coupons:');
  console.log('WELCOME10 - 10% off orders above ₹2000');
  console.log('FIRSTORDER - ₹500 off orders above ₹1000');
  console.log('FREESHIP - Free shipping on orders above ₹1000');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });