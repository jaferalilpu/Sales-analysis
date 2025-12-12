const axios = require('axios');

async function testAdminSession() {
  try {
    console.log('🧪 Testing Admin Session Flow...');
    
    // Step 1: Login and get cookies
    console.log('📝 Step 1: Login to get cookies...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@ulica.com',
      password: 'Admin@123'
    }, {
      withCredentials: true
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }

    console.log('✅ Login successful!');
    console.log('👤 User role:', loginResponse.data.data.user.role);
    
    // Extract cookies from response
    const cookies = loginResponse.headers['set-cookie'];
    if (!cookies) {
      console.log('❌ No cookies received');
      return;
    }

    console.log('🍪 Cookies received:', cookies.length);
    
    // Step 2: Test admin dashboard access
    console.log('\\n📝 Step 2: Testing admin dashboard access...');
    
    const dashboardResponse = await axios.get('http://localhost:3000/admin', {
      headers: {
        'Cookie': cookies.join('; ')
      },
      withCredentials: true
    });

    console.log('✅ Admin page loaded successfully!');
    console.log('📄 Response length:', dashboardResponse.data.length);
    
    // Check if it's showing the spinner or actual content
    if (dashboardResponse.data.includes('spinner')) {
      console.log('⚠️  Admin page is still showing spinner - token might not be accessible');
    } else {
      console.log('✅ Admin page loaded with content!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAdminSession();
