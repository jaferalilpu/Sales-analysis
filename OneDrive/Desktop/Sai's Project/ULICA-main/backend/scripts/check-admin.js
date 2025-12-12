const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@ulica.com' }
    });

    if (!admin) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('🔍 Admin user details:');
    console.log('=====================================');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👤 Name: ${admin.name}`);
    console.log(`🔐 Role: ${admin.role}`);
    console.log(`✅ Is Active: ${admin.isActive}`);
    console.log(`📧 Email Verified: ${admin.isEmailVerified}`);
    console.log(`📅 Created: ${admin.createdAt}`);
    
    // Test password
    const testPassword = 'Admin@123';
    const isValidPassword = await bcrypt.compare(testPassword, admin.password);
    console.log(`🔑 Password Valid: ${isValidPassword}`);
    
    if (!admin.isActive) {
      console.log('⚠️  Admin user is not active!');
    }
    
    if (!admin.isEmailVerified) {
      console.log('⚠️  Admin email is not verified!');
    }
    
  } catch (error) {
    console.error('❌ Error checking admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
