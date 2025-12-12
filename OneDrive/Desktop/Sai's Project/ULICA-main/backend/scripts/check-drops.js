const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDrops() {
  try {
    const now = new Date();
    console.log(`\n📅 Current time: ${now.toISOString()}\n`);

    // Get all drops
    const allDrops = await prisma.drop.findMany({
      include: {
        dropProducts: {
          include: {
            product: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        _count: {
          select: {
            dropProducts: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📦 Total drops found: ${allDrops.length}\n`);

    if (allDrops.length === 0) {
      console.log('❌ No drops found in database');
      return;
    }

    allDrops.forEach((drop, index) => {
      console.log(`${index + 1}. ${drop.name}`);
      console.log(`   Status: ${drop.status}`);
      console.log(`   Published: ${drop.isPublished ? 'Yes' : 'No'}`);
      console.log(`   Start Date: ${new Date(drop.startDate).toLocaleString()}`);
      console.log(`   End Date: ${new Date(drop.endDate).toLocaleString()}`);
      
      const startDate = new Date(drop.startDate);
      const endDate = new Date(drop.endDate);
      const isLive = drop.isPublished && 
                     drop.status === 'live' && 
                     startDate <= now && 
                     endDate >= now;
      
      console.log(`   Currently Live: ${isLive ? '✅ YES' : '❌ NO'}`);
      console.log(`   Products: ${drop._count.dropProducts}`);
      
      if (drop._count.dropProducts > 0) {
        console.log(`   Product List:`);
        drop.dropProducts.forEach((dp, i) => {
          console.log(`     ${i + 1}. ${dp.product?.title || 'Unknown'}`);
        });
      }
      console.log('');
    });

    // Check specifically for live drops
    const liveDrops = allDrops.filter(drop => {
      const startDate = new Date(drop.startDate);
      const endDate = new Date(drop.endDate);
      return drop.isPublished && 
             drop.status === 'live' && 
             startDate <= now && 
             endDate >= now;
    });

    console.log(`\n🎯 Live Drops: ${liveDrops.length}`);
    if (liveDrops.length > 0) {
      liveDrops.forEach(drop => {
        console.log(`   ✅ ${drop.name} (${drop._count.dropProducts} products)`);
      });
    } else {
      console.log('   ❌ No live drops found');
    }

  } catch (error) {
    console.error('❌ Error checking drops:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDrops();

