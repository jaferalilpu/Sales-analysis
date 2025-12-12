const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAdminEmail() {
  try {
    console.log('🔧 Fixing admin email verification...');
    
    const admin = await prisma.user.update({
      where: { email: 'admin@ulica.com' },
      data: { 
        isEmailVerified: true 
      }
    });

    console.log('✅ Admin email verification fixed!');
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.name);
    console.log('🔐 Role:', admin.role);
    console.log('✅ Is Active:', admin.isActive);
    console.log('📧 Email Verified:', admin.isEmailVerified);
    
  } catch (error) {
    console.error('❌ Error fixing admin email:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminEmail();
