import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script to update existing products with discounted prices (compareAtPrice)
 * This will:
 * 1. Update all products with compareAtPrice based on their variants
 * 2. Update all variants to ensure they have compareAtPrice set
 */
async function updateProductDiscounts() {
  console.log('🔄 Starting product discount update...\n');

  try {
    // Get all products with their variants
    const products = await prisma.product.findMany({
      include: {
        variants: true,
      },
    });

    console.log(`📦 Found ${products.length} products to update\n`);

    let updatedProducts = 0;
    let updatedVariants = 0;

    for (const product of products) {
      let productUpdated = false;

      // Calculate product-level compareAtPrice from variants
      const variantComparePrices = product.variants
        .filter((v) => v.compareAtPrice && v.compareAtPrice > 0)
        .map((v) => v.compareAtPrice!);

      const maxComparePrice = variantComparePrices.length > 0
        ? Math.max(...variantComparePrices)
        : null;

      // Update product compareAtPrice if it's missing or different
      if (maxComparePrice && product.compareAtPrice !== maxComparePrice) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            compareAtPrice: maxComparePrice,
          },
        });
        productUpdated = true;
        updatedProducts++;
        console.log(`✅ Updated product: ${product.title} - compareAtPrice: ₹${maxComparePrice / 100}`);
      }

      // Update variants that don't have compareAtPrice
      // Set compareAtPrice to be 25-50% higher than price for variants without it
      for (const variant of product.variants) {
        if (!variant.compareAtPrice || variant.compareAtPrice <= variant.price) {
          // Set compareAtPrice to be 30% higher than price (minimum)
          const newComparePrice = Math.round(variant.price * 1.3);

          await prisma.productVariant.update({
            where: { id: variant.id },
            data: {
              compareAtPrice: newComparePrice,
            },
          });
          updatedVariants++;
          console.log(`  ✓ Updated variant: ${variant.sku} - compareAtPrice: ₹${newComparePrice / 100} (was ₹${variant.price / 100})`);
        }
      }

      if (productUpdated) {
        console.log('');
      }
    }

    console.log('\n🎉 Product discount update completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Products updated: ${updatedProducts}`);
    console.log(`   - Variants updated: ${updatedVariants}`);
    console.log(`   - Total products: ${products.length}`);
  } catch (error) {
    console.error('❌ Error updating product discounts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateProductDiscounts()
  .catch((error) => {
    console.error('❌ Failed to update product discounts:', error);
    process.exit(1);
  });

