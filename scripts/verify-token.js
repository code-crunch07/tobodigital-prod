const jwt = require('jsonwebtoken');

// Token provided by user
const token = process.argv[2] || '547b4cc6d50484709569e0987ac481b8e9ba40a003b033f6203ab7432579807f7007547a10f1dab1b422e75ca80a5eb99ce85669442047617a4379941065f59b';

// JWT Secret from environment or default
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

console.log('Token provided:', token);
console.log('Token length:', token.length);
console.log('Token format check:', token.split('.').length === 3 ? 'Valid JWT format' : 'Invalid JWT format (should have 3 parts separated by dots)');
console.log('');

if (token.split('.').length === 3) {
  try {
    // Try to decode without verification first
    const decoded = jwt.decode(token, { complete: true });
    console.log('Decoded token (without verification):');
    console.log(JSON.stringify(decoded, null, 2));
    console.log('');

    // Try to verify
    try {
      const verified = jwt.verify(token, JWT_SECRET);
      console.log('Token verification: SUCCESS');
      console.log('Decoded payload:', JSON.stringify(verified, null, 2));
    } catch (verifyError) {
      console.log('Token verification: FAILED');
      console.log('Error:', verifyError.message);
      console.log('');
      console.log('Possible issues:');
      console.log('1. Token might be expired');
      console.log('2. JWT_SECRET might not match');
      console.log('3. Token might be corrupted');
    }
  } catch (error) {
    console.log('Error decoding token:', error.message);
  }
} else {
  console.log('This does not appear to be a valid JWT token.');
  console.log('A JWT token should have the format: header.payload.signature');
  console.log('Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIn0.signature');
  console.log('');
  console.log('Possible issues:');
  console.log('1. Token might be a hash instead of a JWT');
  console.log('2. Token might be corrupted or incomplete');
  console.log('3. Token might be from a different authentication system');
}

