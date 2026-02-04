# 🚀 CloudPanel.io Quick Reference Guide

Quick commands and tips for managing your Tobo E-commerce deployment on CloudPanel.io.

## 📋 Prerequisites Checklist

Before deployment, ensure you have:
- [ ] VPS with CloudPanel.io installed
- [ ] Domain names configured (or subdomains)
- [ ] MongoDB Atlas account (or local MongoDB)
- [ ] SSH access to VPS
- [ ] Node.js 18+ installed

---

## 🔧 Initial Setup (One-Time)

### 1. Upload Code to VPS

```bash
# Option A: Using Git
cd /home/cloudpanel/htdocs
git clone https://github.com/yourusername/tobo-backend.git
cd tobo-backend

# Option B: Using SCP (from local machine)
scp -r /path/to/tobo-backend root@your-vps-ip:/home/cloudpanel/htdocs/
```

### 2. Run Deployment Script

```bash
cd /home/cloudpanel/htdocs/tobo-backend
chmod +x deploy-cloudpanel.sh
./deploy-cloudpanel.sh
```

### 3. Configure Environment Variables

Edit these files with your actual values:

```bash
# Backend
nano .env
# Add: MONGODB_URI, JWT_SECRET, etc.

# Frontend (Dashboard)
nano dashboard/.env.local
# Add: NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api

# Client
nano client/.env.local
# Add: NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### 4. Create Admin User

```bash
npm run create-admin
```

---

## 🔄 Daily Operations

### View Application Status

```bash
pm2 status
```

### View Logs

```bash
# All logs
pm2 logs

# Specific app
pm2 logs tobo-backend
pm2 logs tobo-dashboard
pm2 logs tobo-client

# Last 100 lines
pm2 logs --lines 100
```

### Restart Applications

```bash
# Restart all
pm2 restart all

# Restart specific app
pm2 restart tobo-backend
pm2 restart tobo-dashboard
pm2 restart tobo-client
```

### Stop/Start Applications

```bash
pm2 stop all
pm2 start all

# Or specific app
pm2 stop tobo-backend
pm2 start tobo-backend
```

---

## 🔄 Update/Deploy New Code

### Method 1: Quick Update (Git Pull)

```bash
cd /home/cloudpanel/htdocs/tobo-backend

# Pull latest code
git pull origin main

# Rebuild and restart
npm install
npm run build
cd dashboard && npm install && npm run build && cd ..
cd client && npm install && npm run build && cd ..
pm2 restart all
```

### Method 2: Full Redeploy

```bash
cd /home/cloudpanel/htdocs/tobo-backend
./deploy-cloudpanel.sh
```

---

## 🗄️ Database Management

### Backup MongoDB (Atlas)

1. Go to MongoDB Atlas Dashboard
2. Click **Backups** → **Create Backup**
3. Or use `mongodump` if local:

```bash
mongodump --uri="mongodb://localhost:27017/tobo" --out=/backup/$(date +%Y%m%d)
```

### Restore MongoDB

```bash
mongorestore --uri="mongodb://localhost:27017/tobo" /backup/20240101/tobo
```

---

## 🌐 Nginx Configuration

### Test Nginx Config

```bash
sudo nginx -t
```

### Reload Nginx

```bash
sudo systemctl reload nginx
```

### View Nginx Logs

```bash
# Error logs
sudo tail -f /var/log/nginx/error.log

# Access logs
sudo tail -f /var/log/nginx/access.log
```

### Edit Nginx Config in CloudPanel

1. Log into CloudPanel
2. Go to **Sites** → Select your site
3. Click **Nginx Config**
4. Edit and save
5. CloudPanel will automatically test and reload

---

## 🔒 SSL Certificate Management

### Setup SSL in CloudPanel

1. Go to **Sites** → Select your site
2. Click **SSL** → **Let's Encrypt**
3. Enter email and domain
4. Click **Install SSL**

### Renew SSL (Auto-renewal is enabled by default)

```bash
sudo certbot renew
```

---

## 📊 Monitoring

### PM2 Monitoring Dashboard

```bash
pm2 monit
```

### System Resources

```bash
# CPU and Memory
htop

# Disk usage
df -h

# Process list
ps aux | grep node
```

### Check Port Usage

```bash
# Check if ports are in use
sudo netstat -tulpn | grep -E ':(3000|3001|5000)'
```

---

## 🐛 Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs --err

# Check if port is available
sudo lsof -i :5000
sudo lsof -i :3000
sudo lsof -i :3001

# Kill process on port (if needed)
sudo kill -9 $(sudo lsof -t -i:5000)
```

### Database Connection Issues

```bash
# Test MongoDB connection
mongosh "mongodb+srv://username:password@cluster.mongodb.net/tobo"

# Check MongoDB service (if local)
sudo systemctl status mongod
```

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
cd dashboard
rm -rf .next
npm run build
```

### Memory Issues

```bash
# Check memory usage
free -h
pm2 monit

# Restart if memory is high
pm2 restart all
```

---

## 🔐 Security

### Firewall Setup (UFW)

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### Change Default Passwords

- MongoDB: Change default admin password
- JWT_SECRET: Use strong random string
- Database users: Use strong passwords

---

## 📝 Environment Variables Reference

### Backend (.env)

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tobo
JWT_SECRET=your-super-secret-key-here
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### Client (.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

---

## 🔄 PM2 Commands Cheat Sheet

```bash
pm2 status              # View all apps
pm2 logs                # View all logs
pm2 logs app-name       # View specific app logs
pm2 restart all         # Restart all apps
pm2 restart app-name    # Restart specific app
pm2 stop all            # Stop all apps
pm2 stop app-name       # Stop specific app
pm2 start all           # Start all apps
pm2 start app-name      # Start specific app
pm2 delete all          # Delete all apps
pm2 delete app-name     # Delete specific app
pm2 save                # Save current process list
pm2 startup             # Generate startup script
pm2 monit               # Monitor dashboard
pm2 flush               # Clear all logs
```

---

## 📁 Important File Locations

```
/home/cloudpanel/htdocs/tobo-backend/          # Project root
/home/cloudpanel/htdocs/tobo-backend/.env      # Backend env
/home/cloudpanel/htdocs/tobo-backend/logs/     # Application logs
/home/cloudpanel/htdocs/tobo-backend/uploads/  # Uploaded files
/home/cloudpanel/htdocs/tobo-backend/ecosystem.config.js  # PM2 config
```

---

## 🆘 Common Issues & Solutions

### Issue: "Port already in use"

```bash
# Find process using port
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>
```

### Issue: "Cannot connect to MongoDB"

- Check MongoDB URI in `.env`
- Verify MongoDB Atlas IP whitelist includes your VPS IP
- Check MongoDB service status (if local)

### Issue: "Next.js build fails"

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Issue: "PM2 apps not starting on reboot"

```bash
# Setup PM2 startup
pm2 startup
# Run the command it outputs
pm2 save
```

### Issue: "Nginx 502 Bad Gateway"

- Check if Node.js apps are running: `pm2 status`
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- Verify proxy_pass URLs in Nginx config

---

## 📞 Getting Help

1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check system logs: `journalctl -xe`
4. Review deployment guide: `docs/CLOUDPANEL_DEPLOYMENT.md`

---

## ✅ Maintenance Checklist

### Daily
- [ ] Check PM2 status: `pm2 status`
- [ ] Review error logs: `pm2 logs --err`

### Weekly
- [ ] Check disk space: `df -h`
- [ ] Review application logs
- [ ] Check MongoDB connection

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Backup database
- [ ] Review security logs
- [ ] Update system: `sudo apt update && sudo apt upgrade`

---

**Last Updated**: 2024








