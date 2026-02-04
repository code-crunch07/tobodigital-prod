# JWT Token Troubleshooting Guide

## Issue: Invalid Token Format

The token you provided is not in the correct JWT format.

### Expected JWT Format
A JWT token should look like this:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIn0.signature
```

It has **3 parts separated by dots**:
1. **Header** (base64 encoded JSON)
2. **Payload** (base64 encoded JSON)
3. **Signature** (HMAC signature)

### Your Token
```
547b4cc6d50484709569e0987ac481b8e9ba40a003b033f6203ab7432579807f7007547a10f1dab1b422e75ca80a5eb99ce85669442047617a4379941065f59b
```

This is a **128-character hex string** without dots, which is NOT a valid JWT.

## How to Debug

### 1. Check localStorage
Open browser console and run:
```javascript
localStorage.getItem('authToken')
```

This should return a JWT token with dots. If it returns the hex string, there's an issue.

### 2. Check API Response
When logging in, check the network tab:
- Go to Network tab in DevTools
- Find the `/api/auth/login` request
- Check the response - `data.token` should be a JWT

### 3. Verify Token Generation
The backend generates tokens correctly. Test with:
```bash
node scripts/test-token-generation.js
```

### 4. Check for Token Modification
Search your codebase for any place that might modify the token:
```bash
grep -r "authToken" client/
grep -r "localStorage" client/
```

## Common Issues

### Issue 1: Token Not Being Stored Correctly
**Symptom**: Token in localStorage is not a JWT
**Solution**: Check `LoginSignupDialog.tsx` - ensure `response.data.token` is stored directly

### Issue 2: Token Being Modified
**Symptom**: Token changes format between API and storage
**Solution**: Check for any middleware or interceptors modifying the token

### Issue 3: Wrong Value Copied
**Symptom**: Copied hash or session ID instead of token
**Solution**: Verify you're copying the correct value from `response.data.token`

## Testing Token Verification

To verify a token manually:
```bash
node scripts/verify-token.js "YOUR_TOKEN_HERE"
```

## Next Steps

1. **Check the actual token** in browser localStorage
2. **Test login** and check the network response
3. **Verify** the token format matches the expected JWT structure
4. **Report** where you found this token value

If you're seeing this hex string somewhere, please let me know:
- Where did you see it? (localStorage, API response, console log, etc.)
- What action were you performing? (login, signup, API call, etc.)
- Any error messages?

