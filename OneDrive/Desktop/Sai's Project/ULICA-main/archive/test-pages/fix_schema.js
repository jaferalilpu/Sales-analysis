const { PrismaClient } = require('@prisma/client');

async function fixSchema() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://postgres.fnmypthchobllrrwtozh:Saisindhu143@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require"
      }
    }
  });

  try {
    console.log('🔄 Fixing database schema...');
    
    // Add the missing lastLogin column
    await prisma.$executeRaw`ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP(3)`;
    console.log('✅ Added lastLogin column');
    
    // Add any other missing columns
    await prisma.$executeRaw`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS "firstName" TEXT,
      ADD COLUMN IF NOT EXISTS "lastName" TEXT
    `;
    console.log('✅ Added firstName and lastName columns');
    
    // Verify the columns exist
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name IN ('lastLogin', 'firstName', 'lastName')
    `;
    
    console.log('✅ Verified columns:', result.map(r => r.column_name));
    console.log('🎉 Database schema fixed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixSchema();
