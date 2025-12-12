const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSimpleAdmin() {
  try {
    console.log('🔄 Creating simple admin user...');
    
    // Delete existing admin
    await prisma.user.deleteMany({
      where: { email: 'admin@ulica.com' }
    });
    console.log('🗑️  Deleted existing admin user');

    // Create new admin with basic fields only
    const adminEmail = 'admin@ulica.com';
    const adminPassword = 'Admin@123';
    const adminName = 'ULICA Admin';

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'admin',
        isActive: true,
        phone: '+91-9876543210'
      }
    });

    console.log('🎉 Admin user created successfully!');
    console.log('=====================================');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`👤 Name: ${adminName}`);
    console.log(`🔐 Role: ${admin.role}`);
    console.log(`✅ Is Active: ${admin.isActive}`);
    console.log('=====================================');
    console.log('🌐 Admin Panel: http://localhost:3000/admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createSimpleAdmin();
