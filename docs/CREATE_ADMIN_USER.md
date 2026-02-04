# Create admin user for dashboard login

The dashboard (admin.tobodigital.com) needs an admin user. Use one of the options below.

## Default admin credentials (after running the script)

- **Email:** `admin@tobo.com`
- **Password:** `admin123`  

**Change this password after first login** (e.g. from Dashboard → Settings or profile).

---

## Option 1: From the server (Node.js installed)

SSH into your server and run from the **project directory** (same folder as `docker-compose.yml` and `.env`):

```bash
cd /opt/tobodigital/tobodigital-prod   # or your DEPLOY_PATH

# Ensure .env has MONGODB_URI (same as used by Docker)
npm run create-admin
```

If you don’t have `ts-node` installed globally, use:

```bash
npx ts-node scripts/create-admin.ts
```

---

## Option 2: Using Docker (no Node.js on server)

From the project directory on the server, run a one-off container that uses your `.env` and creates the admin user:

```bash
cd /opt/tobodigital/tobodigital-prod   # or your DEPLOY_PATH

docker run --rm -v "$(pwd)":/app -w /app --env-file .env node:20-alpine sh -c "npm install && npx ts-node scripts/create-admin.ts"
```

This may take a minute the first time (npm install). When it finishes, you’ll see:

- `Admin user created successfully!`
- Email: **admin@tobo.com**
- Password: **admin123**

---

## Option 3: Run inside the backend container (recommended if Option 2 fails)

If you see **`getaddrinfo ENOTFOUND ...`** or similar, your `.env` may point at a hostname that only works on another Docker network. Use the **running backend container** instead—it already has the correct `MONGODB_URI` and network:

```bash
cd /opt/tobodigital/tobodigital-prod   # or your DEPLOY_PATH

docker compose exec backend node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./dist/models/User').default;
  const hashed = await bcrypt.hash('admin123', 10);
  await User.findOneAndUpdate(
    { email: 'admin@tobo.com' },
    { \$set: { name: 'Admin User', password: hashed, role: 'admin', isActive: true } },
    { upsert: true, new: true }
  );
  console.log('Admin ready: admin@tobo.com / admin123');
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
"
```

This uses the same MongoDB connection as your live backend, so no hostname/network issues.

---

## After creating the admin

1. Open **admin.tobodigital.com** (or your dashboard URL).
2. Log in with **admin@tobo.com** / **admin123**.
3. Change the password from the dashboard (e.g. profile or settings).

## If admin already exists

The script is safe to run again. If `admin@tobo.com` already exists, it will reset the password to **admin123** and ensure the user is active and has the admin role.
