

// Actually Node 18 has native fetch.

async function testLogin() {
  // Use formatting from verify-register-db.js for consistency
  const email = 'test_login@example.com';
  const password = 'password123';
  
  // Registration first (to ensure user exists)
  // But strictly we want to test login.
  // I will assume the user from previous test exists or create one.
  // Let's create a separate full flow test: Register -> Login
  
  const uniqueId = Date.now();
  const testUser = {
    name: 'Login Test User',
    email: `login_${uniqueId}@example.com`,
    password: 'password123',
    confirmPassword: 'password123',
    phone: '1122334455'
  };

  try {
    console.log('1. Registering user...');
    const regRes = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    if (regRes.status !== 201) {
        console.error('Registration failed:', await regRes.text());
        return;
    }
    console.log('✅ Registration success');

    // Extract cookie from registration (auto-login)
    const cookie = regRes.headers.get('set-cookie');
    if (cookie) console.log('✅ Auto-login cookie received');

    console.log('2. Testing explicit login...');
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });
    
    const loginData = await loginRes.json();
    
    if (loginRes.status === 200 && loginData.user) {
        console.log('✅ Login success');
        console.log('User:', loginData.user);
    } else {
        console.error('Login failed:', loginData);
    }
    
  } catch (e) {
      console.error('Error:', e);
  }
}

testLogin();
