const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('🧪 Testing Admin Login...');
    
    const response = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@ulica.com',
      password: 'Admin@123'
    });

    if (response.data.success) {
      console.log('✅ Admin login successful!');
      console.log('📧 Email:', response.data.data.user.email);
      console.log('👤 Name:', response.data.data.user.name);
      console.log('🔐 Role:', response.data.data.user.role);
      console.log('🎫 Access Token:', response.data.data.accessToken.substring(0, 50) + '...');
      
      // Test admin dashboard access
      console.log('\n🧪 Testing Admin Dashboard Access...');
      const dashboardResponse = await axios.get('http://localhost:5001/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${response.data.data.accessToken}`
        }
      });
      
      if (dashboardResponse.data.success) {
        console.log('✅ Admin dashboard accessible!');
        console.log('📊 Stats:', dashboardResponse.data.data.stats);
      }
      
    } else {
      console.log('❌ Admin login failed:', response.data.message);
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Login failed:', error.response.data.message || error.response.statusText);
      console.log('Status:', error.response.status);
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

testAdminLogin();
