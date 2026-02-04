# Deploy Tobo on CloudPanel with Docker (tobodigital.com)

This guide covers deploying the Tobo stack with **Docker** on CloudPanel, using your domain **tobodigital.com**, and storing uploads in a **folder you create in CloudPanel**.

---

## URLs (tobodigital.com)

| Service   | URL                        | Purpose                |
|----------|----------------------------|------------------------|
| **API**  | `https://api.tobodigital.com` | Backend REST API       |
| **Dashboard** | `https://admin.tobodigital.com` | Admin panel (login, products, orders, etc.) |
| **Store** | `https://tobodigital.com`  | Customer-facing store  |

Point your DNS (at your domain registrar) for:

- `api.tobodigital.com` → your server IP  
- `admin.tobodigital.com` → your server IP  
- `tobodigital.com` and `www.tobodigital.com` → your server IP  

The admin dashboard is served at **admin.tobodigital.com** (subdomain).  

---

## 1. Prerequisites on the server

- CloudPanel installed on the VPS
- Docker and Docker Compose installed
- MongoDB (Atlas or self-hosted) and connection string

Install Docker (if needed):

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in, or: newgrp docker
```

Install Docker Compose v2 (if not present):

```bash
sudo apt-get update && sudo apt-get install -y docker-compose-plugin
docker compose version
```

---

## 2. Uploads folder in CloudPanel (for images)

Create a **dedicated folder** for uploads so images persist and survive container rebuilds.

### Option A: Create via CloudPanel File Manager

1. Log in to **CloudPanel**.
2. Open **Files** → **File Manager**.
3. Go to the site or a shared data path (e.g. `/home/cloudpanel/htdocs` or `/home/cloudpanel/data`).
4. Create a folder, e.g. **`tobo-uploads`**.
5. Inside it create: **`public`** (full path e.g. `/home/cloudpanel/htdocs/tobo-uploads/public`).
6. Set permissions so the Docker container can write (e.g. `chmod 755` on both; see below).

### Option B: Create via SSH

```bash
# Example: under your site or a shared path
sudo mkdir -p /home/cloudpanel/htdocs/tobo-uploads/public
sudo chown -R 1000:1000 /home/cloudpanel/htdocs/tobo-uploads
sudo chmod -R 755 /home/cloudpanel/htdocs/tobo-uploads
```

Use this path as the **host path** for the backend uploads volume in Docker (step 4).

---

## 3. Deploy the app (clone + env)

On the server (e.g. via SSH):

```bash
cd /home/cloudpanel/htdocs
git clone <your-repo-url> tobo-backend
cd tobo-backend
```

Create `.env` from the example and set your values:

```bash
cp .env.docker.example .env
nano .env
```

Set at least:

- **MONGODB_URI** – MongoDB connection string  
- **JWT_SECRET** – long random secret (e.g. `openssl rand -base64 32`)  
- **NEXT_PUBLIC_API_URL** – `https://api.tobodigital.com/api` (for dashboard and client builds)

Save and exit.

---

## 4. Use CloudPanel uploads folder in Docker

Edit `docker-compose.yml` and replace the **backend** `volumes` section so the container uses your CloudPanel folder.

**Replace this:**

```yaml
    volumes:
      - uploads_data:/data/uploads/public
```

**With (use your actual path):**

```yaml
    volumes:
      - /home/cloudpanel/htdocs/tobo-uploads/public:/data/uploads/public
```

So the backend service looks like:

```yaml
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: tobo-backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: ${MONGODB_URI}
      JWT_SECRET: ${JWT_SECRET}
      UPLOADS_DIR: /data/uploads/public
    volumes:
      - /home/cloudpanel/htdocs/tobo-uploads/public:/data/uploads/public
```

- **Host path**: the folder you created in CloudPanel (e.g. `.../tobo-uploads/public`).  
- **Container path**: `/data/uploads/public` (backend reads `UPLOADS_DIR` and serves files from here).

All uploaded images will be stored in that CloudPanel directory and will persist across container restarts and rebuilds.

---

## 5. Build and run

```bash
cd /home/cloudpanel/htdocs/tobo-backend
docker compose up -d --build
```

Check that containers are running:

```bash
docker compose ps
```

You should see:

- **tobo-backend** (port 5000)
- **tobo-dashboard** (port 3000)
- **tobo-client** (port 3001)

---

## 6. Point CloudPanel/Nginx to Docker

You need to proxy each subdomain to the correct container port.

- **api.tobodigital.com** → `http://127.0.0.1:5000`
- **admin.tobodigital.com** → `http://127.0.0.1:3000` (dashboard)
- **tobodigital.com** (and www) → `http://127.0.0.1:3001` (store)

### In CloudPanel

1. **Sites** → create (or use existing) sites for:
   - `api.tobodigital.com`
   - `admin.tobodigital.com`
   - `tobodigital.com` (and optionally `www.tobodigital.com`)
2. For each site, set Nginx to reverse proxy to the correct port (snippets below).
3. Enable **SSL** (e.g. Let’s Encrypt) for each domain.

### Example Nginx snippets

**API (`api.tobodigital.com`):**

```nginx
location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
client_max_body_size 10M;
```

**Dashboard (`admin.tobodigital.com`):**

```nginx
# Dashboard (admin subdomain)
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**Store (`tobodigital.com` and `www.tobodigital.com`):**

```nginx
location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

After editing, reload Nginx (e.g. from CloudPanel or `sudo systemctl reload nginx`).

---

## 7. Create admin user (first time)

Run the create-admin script **on the server** (or your machine) with the **same** `MONGODB_URI` as in your `.env`—not inside the Docker container:

```bash
cd /home/cloudpanel/htdocs/tobo-backend
npm install
npx ts-node scripts/create-admin.ts
```

Default admin (change after first login):

- **Email:** `admin@tobo.com`
- **Password:** `admin123`

---

## 8. Verify

- **API**: open `https://api.tobodigital.com` → should return JSON (e.g. “Tobo Backend API”).
- **Dashboard**: open `https://admin.tobodigital.com` → login page; log in with admin email/password.
- **Store**: open `https://tobodigital.com` → storefront.
- **Uploads**: in the dashboard, upload an image (e.g. product or banner); then check that the file appears in `/home/cloudpanel/htdocs/tobo-uploads/public` (or the path you used).

---

## 9. Useful commands

```bash
# Logs
docker compose logs -f
docker compose logs -f backend

# Restart after .env or code change
docker compose up -d --build

# Stop
docker compose down

# Only backend (e.g. after changing UPLOADS_DIR or volume)
docker compose up -d --build backend
```

---

## Summary

| Question | Answer |
|----------|--------|
| **Dashboard URL** | **https://admin.tobodigital.com** |
| **Store URL** | **https://tobodigital.com** |
| **API URL** | **https://api.tobodigital.com** |
| **Uploads** | Create a folder in CloudPanel (e.g. `tobo-uploads/public`), then bind-mount it in `docker-compose.yml` as shown in step 4. All uploads will be stored there. |
