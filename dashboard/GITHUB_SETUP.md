# 🔧 GitHub Repository Setup

## Create Repository on GitHub

1. **Go to GitHub**: https://github.com/new
2. **Repository name**: `tobo-dashboard`
3. **Visibility**: Choose Public or Private
4. **Important**: Do NOT check:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
5. **Click**: "Create repository"

## After Creating Repository

Run these commands in the `frontend` directory:

```bash
cd frontend
git add .
git commit -m "Ready for Vercel deployment"
git push -u origin main
```

## If You Already Have a Repository

If the repository `tobo-dashboard` already exists but you're getting errors:

1. **Check if you have access**: Make sure you're logged into GitHub
2. **Check repository name**: Verify it's exactly `tobo-dashboard`
3. **Try with SSH** (if you have SSH keys set up):
   ```bash
   git remote set-url origin git@github.com:code-crunch07/tobo-dashboard.git
   git push -u origin main
   ```

## Alternative: Use Existing Repository

If you want to use the existing `tobo` repository instead:

```bash
git remote set-url origin https://github.com/code-crunch07/tobo.git
git push -u origin main
```

Then in Vercel, you can specify the `frontend` directory as the root directory.

