#!/bin/bash

# ToboDigital Quick Update Script
# Run this after uploading/pulling code to deploy changes

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Resolve project directory to the location of this script
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo -e "${GREEN}🚀 Starting ToboDigital update...${NC}"

# Check project root
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: docker-compose.yml not found. Please run this script from the project root directory.${NC}"
    exit 1
fi

# Pull latest code if git repo
if [ -d .git ]; then
    echo -e "${YELLOW}📥 Pulling latest code...${NC}"
    git pull || echo -e "${YELLOW}⚠️  Git pull failed, continuing with current code...${NC}"
else
    echo -e "${YELLOW}⚠️  Not a git repository, skipping git pull...${NC}"
fi

# Build images
echo -e "${YELLOW}🔨 Building Docker images...${NC}"
docker compose build --no-cache

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker compose down

# Start containers
echo -e "${YELLOW}🚀 Starting containers...${NC}"
docker compose up -d

# Wait a bit
echo -e "${YELLOW}⏳ Waiting for containers to be healthy...${NC}"
sleep 15

# Show status
echo -e "${YELLOW}📊 Container status:${NC}"
docker compose ps

# Health check against backend API
echo -e "${YELLOW}🏥 Testing backend health endpoint...${NC}"
if curl -f http://localhost:5000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is responding on port 5000!${NC}"
else
    echo -e "${RED}⚠️  Backend health check failed. Check logs with: docker compose logs backend${NC}"
fi

echo -e "${GREEN}✅ ToboDigital update complete!${NC}"
echo ""
echo -e "${YELLOW}📊 Useful commands:${NC}"
echo "  View backend logs: docker compose logs -f backend"
echo "  View dashboard logs: docker compose logs -f dashboard"
echo "  View client logs: docker compose logs -f client"
echo "  Check status: docker compose ps"
echo "  Health check: curl http://localhost:5000/"

