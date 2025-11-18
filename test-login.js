// Test Supabase Login
// Run this in browser console to test if credentials work

async function testLogin() {
  const email = 'admin@green.vgs';
  const password = prompt('Enter your password:');
  
  console.log('Testing login with:', email);
  
  const response = await fetch('https://kehfohfqjqgwrrpinilx.supabase.co/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlaGZvaGZxanFnd3JycGluaWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2OTkzNTIsImV4cCI6MjA3ODI3NTM1Mn0.VEKOi1YWP2uV4U2PkDyRyJ7b1-TAl3A_tB5BMuFbj5A',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ LOGIN SUCCESS!');
    console.log('User:', data.user.email);
    console.log('Access Token:', data.access_token);
    return data;
  } else {
    console.log('❌ LOGIN FAILED!');
    console.log('Error:', data);
    return data;
  }
}

// Run the test
testLogin();
