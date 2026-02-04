#!/bin/bash

# CloudPanel.io Deployment Script for Tobo E-commerce Platform
# Run this script on your VPS after uploading your code

set -e  # Exit on error

echo "🚀 Starting Tobo E-commerce Platform Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}⚠️  Some commands may require sudo. Running as current user...${NC}"
fi

# Get the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo -e "${GREEN}✓${NC} Project directory: $PROJECT_DIR"

# Step 1: Check Node.js
echo -e "\n${YELLOW}Step 1: Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗${NC} Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✓${NC} Node.js version: $NODE_VERSION"

# Step 2: Check PM2
echo -e "\n${YELLOW}Step 2: Checking PM2 installation...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️${NC} PM2 not found. Installing PM2 globally..."
    npm install -g pm2
fi
echo -e "${GREEN}✓${NC} PM2 is installed"

# Step 3: Check environment files
echo -e "\n${YELLOW}Step 3: Checking environment files...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}✗${NC} .env file not found!"
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cat > .env << EOF
PORT=5000
NODE_ENV=production
MONGODB_URI=your-mongodb-connection-string-here
JWT_SECRET=$(openssl rand -base64 32)
EOF
    echo -e "${YELLOW}⚠️${NC} Please edit .env file and add your MongoDB connection string!"
    echo -e "${YELLOW}⚠️${NC} Press Enter after editing .env file..."
    read
fi
echo -e "${GREEN}✓${NC} .env file exists"

if [ ! -f "dashboard/.env.local" ]; then
    echo -e "${YELLOW}⚠️${NC} dashboard/.env.local not found. Creating template..."
    cat > dashboard/.env.local << EOF
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
EOF
    echo -e "${YELLOW}⚠️${NC} Please edit dashboard/.env.local and update API URL!"
fi

if [ ! -f "client/.env.local" ]; then
    echo -e "${YELLOW}⚠️${NC} client/.env.local not found. Creating template..."
    cat > client/.env.local << EOF
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
EOF
    echo -e "${YELLOW}⚠️${NC} Please edit client/.env.local and update API URL!"
fi

# Step 4: Install dependencies
echo -e "\n${YELLOW}Step 4: Installing dependencies...${NC}"

echo -e "${YELLOW}Installing backend dependencies...${NC}"
npm install

echo -e "${YELLOW}Installing dashboard dependencies...${NC}"
cd dashboard
npm install
cd ..

echo -e "${YELLOW}Installing client dependencies...${NC}"
cd client
npm install
cd ..

echo -e "${GREEN}✓${NC} All dependencies installed"

# Step 5: Build applications
echo -e "\n${YELLOW}Step 5: Building applications...${NC}"

echo -e "${YELLOW}Building backend...${NC}"
npm run build

echo -e "${YELLOW}Building dashboard...${NC}"
cd dashboard
npm run build
cd ..

echo -e "${YELLOW}Building client...${NC}"
cd client
npm run build
cd ..

echo -e "${GREEN}✓${NC} All applications built"

# Step 6: Create logs directory
echo -e "\n${YELLOW}Step 6: Creating logs directory...${NC}"
mkdir -p logs
echo -e "${GREEN}✓${NC} Logs directory created"

# Step 7: Update PM2 ecosystem file paths
echo -e "\n${YELLOW}Step 7: Updating PM2 ecosystem file...${NC}"
# Update paths in ecosystem.config.js if needed
if [ -f "ecosystem.config.js" ]; then
    # Replace the cwd path with actual path
    sed -i "s|/home/cloudpanel/htdocs/tobo-backend|$PROJECT_DIR|g" ecosystem.config.js
    echo -e "${GREEN}✓${NC} PM2 ecosystem file updated"
else
    echo -e "${RED}✗${NC} ecosystem.config.js not found!"
    exit 1
fi

# Step 8: Stop existing PM2 processes
echo -e "\n${YELLOW}Step 8: Stopping existing PM2 processes...${NC}"
pm2 delete all 2>/dev/null || true
echo -e "${GREEN}✓${NC} Existing processes stopped"

# Step 9: Start applications with PM2
echo -e "\n${YELLOW}Step 9: Starting applications with PM2...${NC}"
pm2 start ecosystem.config.js
pm2 save
echo -e "${GREEN}✓${NC} Applications started"

# Step 10: Setup PM2 startup script
echo -e "\n${YELLOW}Step 10: Setting up PM2 startup script...${NC}"
STARTUP_CMD=$(pm2 startup | grep -o 'sudo.*')
if [ ! -z "$STARTUP_CMD" ]; then
    echo -e "${YELLOW}⚠️${NC} Run this command to enable PM2 on system startup:"
    echo -e "${GREEN}$STARTUP_CMD${NC}"
else
    echo -e "${GREEN}✓${NC} PM2 startup already configured"
fi

# Step 11: Display status
echo -e "\n${YELLOW}Step 11: Application Status${NC}"
pm2 status

echo -e "\n${GREEN}✅ Deployment Complete!${NC}"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. Configure Nginx reverse proxy (see docs/CLOUDPANEL_DEPLOYMENT.md)"
echo -e "2. Setup SSL certificates in CloudPanel"
echo -e "3. Create admin user: ${GREEN}npm run create-admin${NC}"
echo -e "4. View logs: ${GREEN}pm2 logs${NC}"
echo -e "5. Monitor: ${GREEN}pm2 monit${NC}"

echo -e "\n${GREEN}🎉 Your applications are now running!${NC}"








