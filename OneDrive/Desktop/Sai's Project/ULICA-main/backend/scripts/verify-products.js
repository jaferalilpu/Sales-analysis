const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyProducts() {
  try {
    const products = await prisma.product.findMany({
      take: 10,
      include: {
        variants: true,
        images: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n✅ Found ${products.length} products:\n`);
    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.title}`);
      console.log(`   - Variants: ${p.variants.length}`);
      console.log(`   - Images: ${p.images.length}`);
      console.log(`   - Price: ₹${p.price}`);
      console.log(`   - Active: ${p.isActive ? 'Yes' : 'No'}`);
      console.log(`   - Featured: ${p.isFeatured ? 'Yes' : 'No'}\n`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyProducts();

