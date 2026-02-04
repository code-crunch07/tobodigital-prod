# 🔗 How to Get NEXT_PUBLIC_API_URL

The `NEXT_PUBLIC_API_URL` is the URL where your **backend API** is running. You need to deploy your backend first, then use that URL.

## Format

The URL should be in this format:
```
https://your-backend-url.com/api
```

**Important**: Make sure to include `/api` at the end!

---

## Option 1: Deploy Backend to Railway (Recommended - Free & Easy)

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (free)

### Step 2: Deploy Backend
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository (the one with your backend code)
4. Railway will auto-detect it's a Node.js app

### Step 3: Set Environment Variables
In Railway project → **Variables** tab, add:
- `MONGODB_URI` = Your MongoDB connection string
- `PORT` = 5000 (or leave default)
- `NODE_ENV` = production

### Step 4: Get Your Backend URL
1. Railway will generate a URL like: `https://your-app-name.railway.app`
2. Your API URL will be: `https://your-app-name.railway.app/api`
3. **Use this for `NEXT_PUBLIC_API_URL` in Vercel**

---

## Option 2: Deploy Backend to Render (Free Tier Available)

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up (free tier available)

### Step 2: Deploy Backend
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `tobo-backend` (or your choice)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: (leave empty if backend is in root)

### Step 3: Set Environment Variables
In Render dashboard → **Environment** tab:
- `MONGODB_URI` = Your MongoDB connection string
- `NODE_ENV` = production

### Step 4: Get Your Backend URL
1. Render will give you a URL like: `https://tobo-backend.onrender.com`
2. Your API URL will be: `https://tobo-backend.onrender.com/api`
3. **Use this for `NEXT_PUBLIC_API_URL` in Vercel**

---

## Option 3: Deploy Backend to Heroku

### Step 1: Create Heroku Account
1. Go to [heroku.com](https://heroku.com)
2. Sign up (note: Heroku now requires paid plans)

### Step 2: Deploy Backend
1. Install Heroku CLI: `brew install heroku/brew/heroku`
2. Login: `heroku login`
3. Create app: `heroku create tobo-backend`
4. Set config vars:
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set NODE_ENV=production
   ```
5. Deploy: `git push heroku main`

### Step 3: Get Your Backend URL
1. Your app URL: `https://tobo-backend.herokuapp.com`
2. Your API URL: `https://tobo-backend.herokuapp.com/api`
3. **Use this for `NEXT_PUBLIC_API_URL` in Vercel**

---

## Option 4: Use ngrok for Local Testing (Temporary)

If you want to test with your local backend:

### Step 1: Install ngrok
```bash
brew install ngrok
# Or download from https://ngrok.com
```

### Step 2: Start Your Local Backend
```bash
npm run dev
# Backend runs on http://localhost:5000
```

### Step 3: Create ngrok Tunnel
```bash
ngrok http 5000
```

### Step 4: Get ngrok URL
ngrok will give you a URL like: `https://abc123.ngrok.io`
- Your API URL: `https://abc123.ngrok.io/api`
- **Use this for `NEXT_PUBLIC_API_URL` in Vercel**

⚠️ **Note**: ngrok free tier URLs change every time you restart. This is only for testing!

---

## Option 5: Use MongoDB Atlas (If Backend is Already Deployed)

If your backend is already deployed somewhere:

1. **Check your hosting provider dashboard** for the app URL
2. **Add `/api`** to the end
3. **Example**: If your backend is at `https://my-backend.example.com`, use `https://my-backend.example.com/api`

---

## How to Set in Vercel

Once you have your backend URL:

1. Go to your Vercel project
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-backend-url.com/api` (your actual URL)
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your project for changes to take effect

---

## Quick Checklist

- [ ] Backend is deployed and accessible
- [ ] Backend URL is working (test in browser: `https://your-backend-url.com/api/dashboard/stats`)
- [ ] CORS is configured to allow your Vercel domain
- [ ] Environment variable is set in Vercel
- [ ] Project is redeployed after setting environment variable

---

## Testing Your Backend URL

Before using it in Vercel, test that your backend is working:

```bash
# Test if backend is accessible
curl https://your-backend-url.com/api/dashboard/stats

# Should return JSON with dashboard stats
```

---

## Recommended: Railway (Easiest)

For the easiest deployment, I recommend **Railway**:
- ✅ Free tier available
- ✅ Easy GitHub integration
- ✅ Automatic HTTPS
- ✅ Simple environment variable management
- ✅ Fast deployment

---

**Need help deploying your backend?** Let me know which platform you prefer!

