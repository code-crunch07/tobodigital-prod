# 🚀 CloudPanel.io VPS Deployment Guide

Complete guide to deploy Tobo E-commerce platform on CloudPanel.io VPS hosting.

## 📋 Prerequisites

- VPS with CloudPanel.io installed
- Domain names (or subdomains) for:
  - Backend API: `api.yourdomain.com`
  - Dashboard: `admin.yourdomain.com`
  - Client: `yourdomain.com` or `shop.yourdomain.com`
- MongoDB Atlas account (or MongoDB installed on VPS)
- SSH access to your VPS
- Node.js 18+ installed on VPS

---

## 🔧 Step 1: Server Setup

### 1.1 Install Node.js (if not installed)

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 1.2 Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 1.3 Install MongoDB (Optional - if not using Atlas)

```bash
# If you want to install MongoDB on the VPS instead of using Atlas
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

## 📦 Step 2: Upload Your Code

### Option A: Using Git (Recommended)

```bash
# Navigate to CloudPanel sites directory
cd /home/cloudpanel/htdocs

# Clone your repository
git clone https://github.com/yourusername/tobo-backend.git
cd tobo-backend
```

### Option B: Using SCP/SFTP

```bash
# From your local machine
scp -r /path/to/tobo-backend root@your-vps-ip:/home/cloudpanel/htdocs/
```

### Option C: Using CloudPanel File Manager

1. Log into CloudPanel
2. Go to **Files** → **File Manager**
3. Upload your project files

---

## 🔐 Step 3: Environment Variables Setup

### 3.1 Backend Environment Variables

```bash
cd /home/cloudpanel/htdocs/tobo-backend

# Create .env file
nano .env
```

Add the following content:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tobo?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important**: 
- Replace `MONGODB_URI` with your actual MongoDB Atlas connection string
- Generate a strong `JWT_SECRET` (you can use: `openssl rand -base64 32`)

### 3.2 Frontend (Dashboard) Environment Variables

```bash
cd /home/cloudpanel/htdocs/tobo-backend/dashboard

# Create .env.local file
nano .env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### 3.3 Client Environment Variables

```bash
cd /home/cloudpanel/htdocs/tobo-backend/client

# Create .env.local file
nano .env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

**Replace `api.yourdomain.com` with your actual backend domain/subdomain**

---

## 🏗️ Step 4: Build Applications

### 4.1 Install Dependencies

```bash
# Backend
cd /home/cloudpanel/htdocs/tobo-backend
npm install

# Frontend (Dashboard)
cd /home/cloudpanel/htdocs/tobo-backend/dashboard
npm install

# Client
cd /home/cloudpanel/htdocs/tobo-backend/client
npm install
```

### 4.2 Build Applications

```bash
# Build Backend
cd /home/cloudpanel/htdocs/tobo-backend
npm run build

# Build Frontend (Dashboard)
cd /home/cloudpanel/htdocs/tobo-backend/dashboard
npm run build

# Build Client
cd /home/cloudpanel/htdocs/tobo-backend/client
npm run build
```

---

## 🚀 Step 5: Setup PM2 for Backend

### 5.1 Create PM2 Ecosystem File

```bash
cd /home/cloudpanel/htdocs/tobo-backend

# Create ecosystem.config.js
nano ecosystem.config.js
```

Add this content:

```javascript
module.exports = {
  apps: [{
    name: 'tobo-backend',
    script: 'dist/server.js',
    cwd: '/home/cloudpanel/htdocs/tobo-backend',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/home/cloudpanel/htdocs/tobo-backend/logs/err.log',
    out_file: '/home/cloudpanel/htdocs/tobo-backend/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
```

### 5.2 Create Logs Directory

```bash
mkdir -p /home/cloudpanel/htdocs/tobo-backend/logs
```

### 5.3 Start Backend with PM2

```bash
cd /home/cloudpanel/htdocs/tobo-backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

The last command will give you a command to run with `sudo` - copy and run it.

---

## 🌐 Step 6: Configure CloudPanel Sites

### 6.1 Create Backend API Site

1. Log into CloudPanel
2. Click **Sites** → **Add Site**
3. Configure:
   - **Domain**: `api.yourdomain.com`
   - **PHP Version**: Not needed (we'll use Node.js)
   - **Document Root**: `/home/cloudpanel/htdocs/tobo-backend` (or leave default)

### 6.2 Create Dashboard Site

1. Click **Sites** → **Add Site**
2. Configure:
   - **Domain**: `admin.yourdomain.com`
   - **Document Root**: `/home/cloudpanel/htdocs/tobo-backend/dashboard`

### 6.3 Create Client Site

1. Click **Sites** → **Add Site**
2. Configure:
   - **Domain**: `yourdomain.com` or `shop.yourdomain.com`
   - **Document Root**: `/home/cloudpanel/htdocs/tobo-backend/client`

---

## ⚙️ Step 7: Configure Nginx

### 7.1 Backend API Nginx Configuration

1. In CloudPanel, go to your **api.yourdomain.com** site
2. Click **Nginx Config** or edit via File Manager:
   - Path: `/home/cloudpanel/htdocs/tobo-backend/nginx-api.conf`

Create/edit the Nginx config:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    # Redirect HTTP to HTTPS (after SSL setup)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    # SSL certificates (CloudPanel will auto-generate these)
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # CORS headers (adjust as needed)
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    
    # Handle preflight requests
    if ($request_method = OPTIONS) {
        return 204;
    }
    
    # Proxy to Node.js backend
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Serve uploaded files directly
    location /uploads {
        alias /home/cloudpanel/htdocs/tobo-backend/uploads/public;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Increase upload size limit
    client_max_body_size 10M;
}
```

### 7.2 Dashboard Nginx Configuration

For `admin.yourdomain.com`:

```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name admin.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/admin.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.yourdomain.com/privkey.pem;
    
    root /home/cloudpanel/htdocs/tobo-backend/dashboard/.next;
    index index.html;
    
    # Serve static files
    location /_next/static {
        alias /home/cloudpanel/htdocs/tobo-backend/dashboard/.next/static;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
    
    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Next.js server-side rendering
    location / {
        try_files $uri $uri/ @nextjs;
    }
    
    location @nextjs {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Note**: For Next.js, you need to run it as a Node.js app with PM2, not as static files.

### 7.3 Client Nginx Configuration

For `yourdomain.com` or `shop.yourdomain.com`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    root /home/cloudpanel/htdocs/tobo-backend/client/.next;
    index index.html;
    
    location /_next/static {
        alias /home/cloudpanel/htdocs/tobo-backend/client/.next/static;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        try_files $uri $uri/ @nextjs;
    }
    
    location @nextjs {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🔄 Step 8: Setup PM2 for Next.js Apps

### 8.1 Update PM2 Ecosystem File

Edit `/home/cloudpanel/htdocs/tobo-backend/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'tobo-backend',
      script: 'dist/server.js',
      cwd: '/home/cloudpanel/htdocs/tobo-backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/home/cloudpanel/htdocs/tobo-backend/logs/backend-err.log',
      out_file: '/home/cloudpanel/htdocs/tobo-backend/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G'
    },
    {
      name: 'tobo-dashboard',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/home/cloudpanel/htdocs/tobo-backend/dashboard',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/home/cloudpanel/htdocs/tobo-backend/logs/dashboard-err.log',
      out_file: '/home/cloudpanel/htdocs/tobo-backend/logs/dashboard-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G'
    },
    {
      name: 'tobo-client',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      cwd: '/home/cloudpanel/htdocs/tobo-backend/client',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/home/cloudpanel/htdocs/tobo-backend/logs/client-err.log',
      out_file: '/home/cloudpanel/htdocs/tobo-backend/logs/client-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G'
    }
  ]
};
```

### 8.2 Restart PM2

```bash
cd /home/cloudpanel/htdocs/tobo-backend
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

---

## 🔒 Step 9: Setup SSL Certificates

1. In CloudPanel, go to each site
2. Click **SSL** → **Let's Encrypt**
3. Enter your email and domain
4. Click **Install SSL**

CloudPanel will automatically configure SSL for all your domains.

---

## 🗄️ Step 10: Database Setup

### If using MongoDB Atlas:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Get your connection string
4. Update `MONGODB_URI` in backend `.env` file
5. Whitelist your VPS IP address in Atlas Network Access

### If using local MongoDB:

```bash
# MongoDB should already be running if you installed it
sudo systemctl status mongod

# Create admin user (if needed)
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "your-password",
  roles: [ { role: "root", db: "admin" } ]
})
```

---

## ✅ Step 11: Create Admin User

```bash
cd /home/cloudpanel/htdocs/tobo-backend
npm run create-admin
```

Or manually via MongoDB:

```bash
mongosh
use tobo
db.users.insertOne({
  name: "Admin",
  email: "admin@yourdomain.com",
  password: "$2b$10$hashedpassword...", // Use bcrypt to hash
  role: "admin"
})
```

---

## 🔍 Step 12: Verify Deployment

### Check PM2 Status

```bash
pm2 status
pm2 logs
```

### Test Backend API

```bash
curl https://api.yourdomain.com/api/health
```

### Test Frontend

- Visit: `https://admin.yourdomain.com`
- Visit: `https://yourdomain.com`

---

## 🔄 Step 13: Setup Auto-Deploy (Optional)

### Using Git Webhook

1. Create a webhook script:

```bash
nano /home/cloudpanel/htdocs/tobo-backend/deploy.sh
```

```bash
#!/bin/bash
cd /home/cloudpanel/htdocs/tobo-backend
git pull origin main
npm install
npm run build
cd dashboard
npm install
npm run build
cd ../client
npm install
npm run build
cd ..
pm2 restart ecosystem.config.js
```

2. Make it executable:

```bash
chmod +x /home/cloudpanel/htdocs/tobo-backend/deploy.sh
```

3. Add webhook URL in your Git provider (GitHub/GitLab) pointing to this script

---

## 📊 Monitoring

### PM2 Monitoring

```bash
# View logs
pm2 logs

# Monitor resources
pm2 monit

# View status
pm2 status
```

### CloudPanel Monitoring

- Use CloudPanel's built-in monitoring
- Check logs in CloudPanel dashboard

---

## 🛠️ Troubleshooting

### Backend not starting

```bash
# Check logs
pm2 logs tobo-backend

# Check if port is in use
sudo netstat -tulpn | grep 5000

# Restart PM2
pm2 restart tobo-backend
```

### Frontend/Client not loading

```bash
# Check Next.js logs
pm2 logs tobo-dashboard
pm2 logs tobo-client

# Rebuild if needed
cd /home/cloudpanel/htdocs/tobo-backend/dashboard
npm run build
pm2 restart tobo-dashboard
```

### Nginx errors

```bash
# Test Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Database connection issues

- Verify MongoDB URI in `.env`
- Check MongoDB Atlas IP whitelist
- Verify MongoDB service is running (if local)

---

## 🔐 Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong MongoDB passwords
- [ ] Enable firewall (UFW)
- [ ] Keep Node.js and dependencies updated
- [ ] Regularly backup database
- [ ] Monitor PM2 logs for errors
- [ ] Use HTTPS for all sites
- [ ] Restrict MongoDB access (if local)

---

## 📝 Quick Commands Reference

```bash
# PM2 Commands
pm2 status                    # View all apps
pm2 logs                      # View all logs
pm2 restart all               # Restart all apps
pm2 restart tobo-backend      # Restart specific app
pm2 stop all                  # Stop all apps
pm2 delete all                # Delete all apps

# Build Commands
cd /home/cloudpanel/htdocs/tobo-backend && npm run build
cd dashboard && npm run build
cd ../client && npm run build

# Logs
pm2 logs tobo-backend
pm2 logs tobo-dashboard
pm2 logs tobo-client
tail -f /home/cloudpanel/htdocs/tobo-backend/logs/*.log

# Nginx
sudo nginx -t                 # Test config
sudo systemctl reload nginx   # Reload Nginx
```

---

## 🎉 Success!

Your Tobo E-commerce platform should now be live at:
- **Backend API**: `https://api.yourdomain.com`
- **Admin Dashboard**: `https://admin.yourdomain.com`
- **Client Store**: `https://yourdomain.com`

---

## 📞 Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify environment variables are set correctly
4. Ensure all domains point to your VPS IP
5. Check MongoDB connection

---

**Last Updated**: 2024
**Version**: 1.0

