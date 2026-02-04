# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Git installed

### 1. Clone and Setup Backend

```bash
# Install backend dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tobo?retryWrites=true&w=majority
EOF

# Run backend
npm run dev
```

Backend will run on `http://localhost:5000`

### 2. Setup Dashboard

```bash
# Navigate to dashboard
cd dashboard

# Install dependencies
npm install

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000/api
EOF

# Run dashboard
npm run dev
```

Dashboard will run on `http://localhost:3000`

### 3. Access Dashboard

Open your browser and visit: `http://localhost:3000`

You'll see the beautiful admin dashboard with:
- 📊 Interactive charts
- 🎨 Bai Jamjuri font throughout
- 🌙 Dark/Light theme toggle
- 📱 Fully responsive design

## 🎯 What's Included

### Backend Features
✅ RESTful API with Express.js  
✅ TypeScript for type safety  
✅ MongoDB with Mongoose ODM  
✅ Complete CRUD operations  
✅ Dashboard analytics  
✅ Order management  
✅ Product catalog  
✅ Customer management  
✅ Categories & Subcategories  

### Frontend Features
✅ Next.js 16 App Router  
✅ Shadcn UI components  
✅ Dark/Light themes  
✅ Responsive design  
✅ Interactive charts (Recharts)  
✅ Beautiful typography (Bai Jamjuri)  
✅ Product management  
✅ Order tracking  
✅ Customer dashboard  

## 📊 Dashboard Sections

1. **Dashboard** - Overview with stats, charts, and recent orders
2. **Products** - Manage your product catalog
3. **Categories** - Organize products by categories
4. **Orders** - Track and manage orders
5. **Customers** - Manage customer accounts

## 🎨 Theme

Toggle between light and dark themes using the button in the top right corner!

## 🔧 Troubleshooting

### Backend won't start
- Check MongoDB connection string in `.env`
- Ensure port 5000 is not in use
- Run `npm install` again

### Frontend won't connect to backend
- Verify backend is running on port 5000
- Check `.env.local` has correct API URL
- Clear browser cache

### Charts not showing
- Check backend is returning data
- Verify MongoDB has data
- Open browser console for errors

## 📝 Next Steps

1. Add your MongoDB connection string
2. Create some products and categories
3. Add customers and orders
4. Customize the dashboard to your needs
5. Add authentication for security

## 🤝 Need Help?

Check the main README.md for detailed documentation!



