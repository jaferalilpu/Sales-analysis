const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👤 Name: ${existingAdmin.firstName || 'Admin'}`);
      console.log(`🔑 Role: ${existingAdmin.role}`);
      return;
    }

    // Create admin user from environment variables
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ulica.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminName = process.env.ADMIN_NAME || 'ULICA Admin';

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: adminName,
        role: 'admin',
        phone: '+91-9876543210'
      }
    });

    console.log('🎉 Admin user created successfully!');
    console.log('=====================================');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`👤 Name: ${adminName}`);
    console.log(`🔐 Role: ${admin.role}`);
    console.log('=====================================');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('🌐 Admin Panel: http://localhost:3000/admin');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdmin();
