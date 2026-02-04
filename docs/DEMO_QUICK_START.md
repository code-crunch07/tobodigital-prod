# 🚀 Dashboard Demo - Quick Start

## 3 Simple Steps to Run Your Dashboard Demo

### Step 1: Setup Environment
Make sure you have a `.env` file with your MongoDB connection:

```bash
# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
EOF
```

### Step 2: Seed Demo Data
```bash
npm run seed:demo
```

This creates:
- 4 Categories
- 6 Products  
- 5 Customers
- 30 Orders (spread across 6 months)

### Step 3: Start Servers

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd dashboard
npm run dev
```

### 🎯 Access Dashboard
Open: **http://localhost:3000**

---

## What You'll See

✅ **Stats Cards**: Total Sales, Orders, Products, Customers  
✅ **Sales Trend Chart**: Monthly sales visualization  
✅ **Order Status Chart**: Distribution pie chart  
✅ **Recent Orders**: Latest 10 orders with details  

---

## Troubleshooting

**If seed script doesn't work:**
- Make sure MongoDB connection string is correct
- Check that MongoDB is accessible
- Try installing ts-node: `npm install --save-dev ts-node`
- Then use: `npx ts-node scripts/seed-demo-data.ts`

**If dashboard shows no data:**
- Verify backend is running on port 5000
- Check browser console for errors
- Ensure seed script completed successfully

---

For detailed instructions, see `DEMO_GUIDE.md`

