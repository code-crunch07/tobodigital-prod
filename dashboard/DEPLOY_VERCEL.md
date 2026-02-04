# 🚀 Deploy Dashboard to Vercel

This guide will help you deploy only the dashboard (frontend) to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free account works)
2. **GitHub/GitLab/Bitbucket Account**: Vercel works best with Git repositories
3. **Backend API**: Your backend should be deployed somewhere (Railway, Render, Heroku, etc.) or running locally for testing

## Step-by-Step Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended)

#### Step 1: Prepare Your Frontend

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Make sure everything is committed to Git:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   ```

#### Step 2: Push to GitHub/GitLab

1. Create a new repository on GitHub (if you haven't already)
2. Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/tobo-dashboard.git
   git push -u origin main
   ```

#### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Vercel will auto-detect Next.js settings
5. **Configure the project:**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend` (if your repo root is the parent directory)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

#### Step 4: Set Environment Variables

**Important**: You need to set the API URL environment variable!

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Add the following variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your backend API URL (e.g., `https://your-backend.railway.app/api` or `https://your-backend.onrender.com/api`)
   - **Environment**: Select all (Production, Preview, Development)

3. Click **Save**

#### Step 5: Deploy

1. Click **Deploy** button
2. Wait for the build to complete (usually 1-2 minutes)
3. Your dashboard will be live at: `https://your-project.vercel.app`

---

### Option 2: Deploy via Vercel CLI

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

#### Step 3: Navigate to Frontend Directory

```bash
cd frontend
```

#### Step 4: Deploy

```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No (for first time)
- **Project name?** → `tobo-dashboard` (or your preferred name)
- **Directory?** → `./` (current directory)
- **Override settings?** → No

#### Step 5: Set Environment Variables

```bash
vercel env add NEXT_PUBLIC_API_URL
```

Enter your backend API URL when prompted (e.g., `https://your-backend.railway.app/api`)

#### Step 6: Deploy to Production

```bash
vercel --prod
```

---

## Environment Variables

You **must** set this environment variable in Vercel:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url.com/api` | Your backend API base URL |

### Where to Get Your Backend URL

If your backend is deployed on:
- **Railway**: `https://your-app.railway.app/api`
- **Render**: `https://your-app.onrender.com/api`
- **Heroku**: `https://your-app.herokuapp.com/api`
- **Local (for testing)**: `http://localhost:5000/api` (not recommended for production)

---

## Project Configuration

If your repository root is the parent directory (not `frontend`), you need to configure Vercel:

1. In Vercel Dashboard → **Settings** → **General**
2. Set **Root Directory** to: `frontend`
3. Save and redeploy

Or create a `vercel.json` in the frontend directory (already created):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

---

## Testing Your Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Check if the dashboard loads
3. Open browser console (F12) to check for API errors
4. Verify API calls are going to the correct backend URL

---

## Troubleshooting

### Dashboard shows "Error loading dashboard"
- **Check**: Is your backend API accessible?
- **Check**: Is `NEXT_PUBLIC_API_URL` set correctly in Vercel?
- **Check**: Does your backend allow CORS from your Vercel domain?

### Build fails
- **Check**: All dependencies are in `package.json`
- **Check**: TypeScript errors (run `npm run build` locally first)
- **Check**: Node version (Vercel uses Node 18+ by default)

### API calls fail (CORS errors)
- **Solution**: Update your backend CORS settings to allow your Vercel domain:
  ```javascript
  app.use(cors({
    origin: ['https://your-project.vercel.app', 'http://localhost:3000']
  }));
  ```

### Environment variables not working
- **Check**: Variable name starts with `NEXT_PUBLIC_` (required for client-side access)
- **Check**: Redeploy after adding environment variables
- **Check**: Variable is set for the correct environment (Production/Preview/Development)

---

## Updating Your Deployment

### Automatic Updates (Recommended)
- Push to your Git repository
- Vercel will automatically deploy on every push to main/master branch

### Manual Update
```bash
cd frontend
vercel --prod
```

---

## Custom Domain (Optional)

1. Go to Vercel Dashboard → **Settings** → **Domains**
2. Add your custom domain (e.g., `dashboard.yourdomain.com`)
3. Follow DNS configuration instructions
4. Update your backend CORS to include the new domain

---

## Quick Checklist

- [ ] Backend is deployed and accessible
- [ ] Frontend code is pushed to Git
- [ ] Vercel project is created
- [ ] `NEXT_PUBLIC_API_URL` environment variable is set
- [ ] Build completes successfully
- [ ] Dashboard loads and shows data
- [ ] API calls are working (check browser console)

---

## Example Backend Deployment Options

If you need to deploy your backend too:

1. **Railway** (Recommended - Easy & Free tier available)
   - Connect GitHub repo
   - Set `MONGODB_URI` environment variable
   - Deploy backend
   - Use Railway URL for `NEXT_PUBLIC_API_URL`

2. **Render** (Free tier available)
   - Create new Web Service
   - Connect GitHub repo
   - Set environment variables
   - Deploy

3. **Heroku** (Paid plans only now)
   - Create new app
   - Connect GitHub
   - Set config vars
   - Deploy

---

**Your dashboard is now live on Vercel! 🎉**

Visit: `https://your-project.vercel.app`

