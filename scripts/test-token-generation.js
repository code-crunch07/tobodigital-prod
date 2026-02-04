const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Simulate token generation like in auth.ts
const testPayload = {
  userId: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  role: 'customer'
};

console.log('Testing JWT Token Generation');
console.log('============================');
console.log('');

// Generate token
const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

console.log('Generated Token:', token);
console.log('Token length:', token.length);
console.log('Token parts:', token.split('.').length);
console.log('');

// Verify token structure
const parts = token.split('.');
if (parts.length === 3) {
  console.log('✅ Token has correct format (header.payload.signature)');
  console.log('Header length:', parts[0].length);
  console.log('Payload length:', parts[1].length);
  console.log('Signature length:', parts[2].length);
  console.log('');
  
  // Decode header
  try {
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    console.log('Header:', JSON.stringify(header, null, 2));
  } catch (e) {
    console.log('Error decoding header:', e.message);
  }
  
  // Decode payload
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    console.log('Payload:', JSON.stringify(payload, null, 2));
  } catch (e) {
    console.log('Error decoding payload:', e.message);
  }
} else {
  console.log('❌ Token format is incorrect');
}

console.log('');
console.log('Verifying token...');
try {
  const verified = jwt.verify(token, JWT_SECRET);
  console.log('✅ Token verification successful');
  console.log('Verified payload:', JSON.stringify(verified, null, 2));
} catch (error) {
  console.log('❌ Token verification failed:', error.message);
}

