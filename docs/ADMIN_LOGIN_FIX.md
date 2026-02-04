# Admin Login Issue - Fixed ✅

## Problem
Unable to login to dashboard with credentials: `admin@tobo.com` / `admin123`

## Solution Applied

### 1. Created Admin User
The admin user has been created successfully in the database:
- **Email**: admin@tobo.com
- **Password**: admin123
- **Role**: admin
- **Status**: Active

### 2. Verification
✅ Admin user exists in database
✅ Password is correctly hashed and verified
✅ User is active and has admin role

## Troubleshooting Steps

### Step 1: Verify Backend Server is Running
Make sure your backend server is running:
```bash
cd /Users/rahulshah/Downloads/tobo-backend
npm run dev
```

The server should be running on `http://localhost:5000`

### Step 2: Check API URL Configuration
In your frontend `.env.local` file, make sure you have:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Step 3: Test Login API Directly
You can test the login endpoint directly:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tobo.com","password":"admin123"}'
```

### Step 4: Check Browser Console
Open browser DevTools (F12) and check:
1. **Console** tab for any JavaScript errors
2. **Network** tab to see if the API call is being made
3. Check the response from `/api/auth/login`

### Step 5: Verify CORS
Make sure CORS is enabled in `src/server.ts`:
```typescript
app.use(cors());
```

## Common Issues

### Issue 1: Backend Not Running
**Symptom**: Network error or connection refused
**Solution**: Start the backend server with `npm run dev`

### Issue 2: Wrong API URL
**Symptom**: 404 error or wrong endpoint
**Solution**: Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`

### Issue 3: CORS Error
**Symptom**: CORS policy error in browser console
**Solution**: Verify CORS is enabled in backend

### Issue 4: Database Connection
**Symptom**: Database connection error
**Solution**: Check MongoDB is running and `MONGODB_URI` is correct

## Quick Fix Commands

### Recreate Admin User
```bash
npm run create-admin
```

### Test Admin Login
```bash
npm run test-admin
```

## Admin Credentials
- **Email**: admin@tobo.com
- **Password**: admin123

**Note**: Change these credentials in production!

## Next Steps
1. Make sure backend server is running (`npm run dev`)
2. Make sure frontend has correct `NEXT_PUBLIC_API_URL`
3. Try logging in again
4. Check browser console for any errors
5. Check network tab to see API response

