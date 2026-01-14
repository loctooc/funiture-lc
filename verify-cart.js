

// Using cross-fetch or similar logic since we removed it before. 
// Node 18 has global fetch, so we can likely skip require if environment is right, but sticking to standard fetch usage.

async function testCart() {
  const productId = 1; // Assuming product ID 1 exists
  const quantity = 1;

  console.log('--- Testing Cart Flow ---');

  // 1. Guest Add to Cart
  console.log('1. Guest adding to cart...');
  let res = await fetch('http://localhost:3000/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity })
  });
  
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Response:', text.substring(0, 200)); // Print first 200 chars

  let data;
  try {
      data = JSON.parse(text);
  } catch (e) {
      console.error('Failed to parse JSON');
      return;
  }

  if (res.status === 200) {
      console.log('✅ Guest added to cart. Count:', data.cartCount);
  } else {
      console.error('❌ Guest add to cart failed:', data);
      return;
  }

  const sessionCookie = res.headers.get('set-cookie');
  if (!sessionCookie) {
      console.error('❌ No session cookie received');
      return;
  }
  console.log('✅ Session cookie received');

  // 2. Register/Login to Sync
  console.log('2. Syncing with Login...');
  // Create a new user for clean test
  const uniqueId = Date.now();
  const testUser = {
    name: 'Cart Test User',
    email: `cart_${uniqueId}@example.com`,
    password: 'password123',
    confirmPassword: 'password123',
    phone: '0909090909'
  };

  // Register with session cookie
  res = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Cookie': sessionCookie 
    },
    body: JSON.stringify(testUser)
  });

  data = await res.json();
  if (res.status === 201) {
      console.log('✅ Registered successfully');
  } else {
      console.error('❌ Registration failed:', data);
      return;
  }

  const authCookie = res.headers.get('set-cookie');
  // Note: Register now returns auth cookie.
  
  // 3. Verify Cart after Login (should have items)
  console.log('3. Verifying User Cart...');
  res = await fetch('http://localhost:3000/api/cart', {
    method: 'GET',
    headers: { 
        'Cookie': authCookie // Use auth cookie (session cookie might be cleared or ignored in favor of auth)
    }
  });

  data = await res.json();
  if (data.cartCount > 0) {
      console.log(`✅ User cart has ${data.cartCount} items (Sync successful)`);
  } else {
      console.error('❌ User cart is empty (Sync failed)');
  }
}

testCart();
