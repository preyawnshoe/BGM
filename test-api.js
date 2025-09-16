// Test script to run API functions directly
require('dotenv').config({ path: '.env.local' });
const register = require('./api/auth/register');

async function testRegister() {
  const mockReq = {
    method: 'POST',
    body: {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    }
  };

  const mockRes = {
    status: (code) => ({
      json: (data) => {
        console.log('Status:', code);
        console.log('Response:', JSON.stringify(data, null, 2));
        return mockRes;
      }
    })
  };

  try {
    await register(mockReq, mockRes);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testRegister();