
 ⚡ Quick Vercel Deployment Guide

## Deploy Dashboard to Vercel in 5 Minutes

### Step 1: Push Frontend to GitHub
```bash
cd dashboard
git init  # if not already a git repo
git add .
git commit -m "Ready for Vercel"
git remote add origin https://github.com/code-crunch07/tobo-dashboard.git
git push -u origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → Sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `dashboard` (if repo root is parent)
   - **Framework**: Next.js (auto-detected)

### Step 3: Set Environment Variable
In Vercel → **Settings** → **Environment Variables**:
- **Name**: `NEXT_PUBLIC_API_URL`
- **Value**: `https://your-backend-url.com/api`
- **Environment**: All

### Step 4: Deploy
Click **Deploy** → Wait 1-2 minutes → Done! 🎉

Your dashboard: `https://your-project.vercel.app`

---

## Important Notes

⚠️ **Backend Required**: Your backend must be deployed separately (Railway, Render, etc.)

⚠️ **CORS**: Make sure your backend allows requests from your Vercel domain

📖 **Full Guide**: See `dashboard/DEPLOY_VERCEL.md` for detailed instructions

