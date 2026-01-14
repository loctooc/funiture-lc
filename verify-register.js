


async function testRegistration() {
  const user = {
    name: 'TestUser_' + Date.now(),
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    phone: '1234567890'
  };

  try {
    console.log('Registering user:', user.email);
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);

    if (response.status === 201) {
      console.log('✅ Registration Successful');
    } else {
      console.log('❌ Registration Failed');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testRegistration();
