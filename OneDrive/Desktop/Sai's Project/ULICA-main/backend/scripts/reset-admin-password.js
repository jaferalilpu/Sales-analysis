const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log('🔑 Resetting admin password...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    
    // Update admin user password
    const updatedUser = await prisma.user.updateMany({
      where: {
        email: 'admin@ulica.com'
      },
      data: {
        password: hashedPassword,
        role: 'admin',
        isActive: true
      }
    });
    
    console.log('✅ Admin password reset successfully!');
    console.log('📧 Email: admin@ulica.com');
    console.log('🔑 Password: Admin@123');
    console.log('👤 Role: admin');
    
  } catch (error) {
    console.error('❌ Error resetting admin password:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
