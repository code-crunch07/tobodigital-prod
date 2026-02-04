#!/bin/bash

# Dashboard Demo Quick Start Script
# This script helps you quickly set up and run the dashboard demo

echo "🎯 Tobo Dashboard Demo Setup"
echo "============================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env file..."
    echo ""
    read -p "Enter your MongoDB URI: " mongodb_uri
    cat > .env << EOF
PORT=5000
NODE_ENV=development
MONGODB_URI=$mongodb_uri
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file found"
fi

echo ""
echo "📦 Seeding demo data..."
npm run seed:demo

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Demo data seeded successfully!"
    echo ""
    echo "🚀 Starting servers..."
    echo ""
    echo "📝 Instructions:"
    echo "   1. Backend will run on http://localhost:5000"
    echo "   2. Open a new terminal and run: cd dashboard && npm run dev"
    echo "   3. Dashboard will run on http://localhost:3000"
    echo "   4. Open http://localhost:3000 in your browser"
    echo ""
    echo "Starting backend server..."
    npm run dev
else
    echo "❌ Failed to seed demo data. Please check your MongoDB connection."
    exit 1
fi

