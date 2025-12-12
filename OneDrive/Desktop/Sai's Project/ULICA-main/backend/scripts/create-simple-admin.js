const bcrypt = require('bcryptjs');

async function createSimpleAdmin() {
  try {
    console.log('🔑 Creating simple admin user...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('Admin@123', 12);
    
    console.log('✅ Password hashed successfully!');
    console.log('📧 Email: admin@ulica.com');
    console.log('🔑 Password: Admin@123');
    console.log('🔐 Hashed Password:', hashedPassword);
    console.log('');
    console.log('Use this hashed password to manually update the database:');
    console.log(`UPDATE users SET password = '${hashedPassword}', role = 'admin', "isActive" = true WHERE email = 'admin@ulica.com';`);
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  }
}

createSimpleAdmin();
