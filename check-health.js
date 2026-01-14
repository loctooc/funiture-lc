
async function checkHealth() {
  console.log('Checking /api/health...');
  try {
    const res = await fetch('http://localhost:3000/api/health');
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text);
  } catch (e) {
    console.error('Fetch error:', e);
  }

  console.log('\nChecking /api/health-db...');
  try {
    const res = await fetch('http://localhost:3000/api/health-db');
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text);
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

checkHealth();
