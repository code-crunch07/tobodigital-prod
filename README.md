# Tobo E-commerce Platform

A complete e-commerce platform with a comprehensive backend API and modern admin dashboard built with Node.js, Express, Next.js, TypeScript, and MongoDB.

## 🎯 Overview

This project consists of:
- **Backend API**: RESTful API built with Express.js and TypeScript
- **Frontend Dashboard**: Modern admin dashboard built with Next.js
- **Database**: MongoDB with Mongoose ODM

### 🎨 Design Features
- Beautiful Bai Jamjuri font throughout the application
- Dark/Light theme support
- Responsive design for all devices
- Interactive charts and analytics
- Modern UI with Shadcn components

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (via MongoDB Atlas)
- **ODM**: Mongoose
- **Environment Config**: dotenv
- **CORS**: Enabled for cross-origin requests
- **Dev Runner**: ts-node-dev (auto-restart)

## 📋 Features

### Dashboard
- View complete statistics including total sales, recent orders, completed orders
- Sales analytics with monthly breakdown
- Product and customer counts

### Products Management
- Complete product listing with pagination and search
- Add/Edit/Delete products
- Extensive product fields including:
  - Main image and gallery images
  - Product details (name, brand, category, etc.)
  - Pricing information
  - Dimensions and weight
  - Shipping and warranty details
  - And much more...

### Categories Management
- Create and manage product categories
- Add/Edit/Delete categories
- Automatic slug generation

### SubCategories Management
- Create subcategories under main categories
- Add/Edit/Delete subcategories
- Filter by parent category

### Orders Management
- View all orders with filters
- Create new orders
- Update order status
- Track order progress (pending → processing → shipped → delivered)
- Payment status tracking

### Customers Management
- Customer listing with pagination
- Add/Edit/Delete customers
- Role-based access control
- Dark/Light theme preference tracking

## 🛠️ Installation

### Backend Setup

1. **Navigate to the backend directory**
   ```bash
   cd tobo-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tobo?retryWrites=true&w=majority
   ```

4. **Run the backend server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

### Dashboard Setup

1. **Navigate to the dashboard directory**
   ```bash
   cd dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Run the dashboard development server**
   ```bash
   npm run dev
   ```

   The dashboard will be available at `http://localhost:3000`

## 📁 Project Structure

```
tobo-backend/
├── src/                          # Backend source code
│   ├── config/
│   │   └── database.ts          # MongoDB connection
│   ├── controllers/              # Route controllers
│   │   ├── dashboard.ts
│   │   ├── products.ts
│   │   ├── categories.ts
│   │   ├── subcategories.ts
│   │   ├── orders.ts
│   │   └── customers.ts
│   ├── models/                   # Mongoose models
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Category.ts
│   │   ├── SubCategory.ts
│   │   └── Order.ts
│   ├── routes/                   # Express routes
│   │   ├── dashboard.ts
│   │   ├── products.ts
│   │   ├── categories.ts
│   │   ├── subcategories.ts
│   │   ├── orders.ts
│   │   └── customers.ts
│   └── server.ts                 # Main server file
├── dashboard/                    # Admin dashboard (Next.js)
│   ├── app/                     # Next.js app directory
│   │   ├── page.tsx             # Dashboard page
│   │   ├── products/            # Products pages
│   │   ├── categories/          # Categories pages
│   │   ├── orders/              # Orders pages
│   │   ├── customers/           # Customers pages
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles
│   ├── components/              # React components
│   │   ├── ui/                  # Shadcn UI components
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   ├── ThemeToggle.tsx      # Theme switcher
│   │   └── ProductForm.tsx      # Product form
│   └── lib/
│       ├── api.ts               # API utilities
│       └── utils.ts             # Utility functions
├── .gitignore
├── package.json                 # Backend dependencies
├── tsconfig.json                # TypeScript config
└── README.md
```

## 📡 API Endpoints

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Products
- `GET /api/products` - Get all products (with pagination, search, filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### SubCategories
- `GET /api/subcategories` - Get all subcategories
- `GET /api/subcategories/category/:categoryId` - Get subcategories by parent category
- `GET /api/subcategories/:id` - Get single subcategory
- `POST /api/subcategories` - Create new subcategory
- `PUT /api/subcategories/:id` - Update subcategory
- `DELETE /api/subcategories/:id` - Delete subcategory

### Orders
- `GET /api/orders` - Get all orders (with pagination, filters)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Customers
- `GET /api/customers` - Get all customers (with pagination, search)
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `PATCH /api/customers/:id/theme` - Update customer theme preference
- `DELETE /api/customers/:id` - Delete customer

## 🚀 Building for Production

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Run the production server**
   ```bash
   npm start
   ```

## 📝 Example API Requests

### Create Product
```bash
POST /api/products
Content-Type: application/json

{
  "mainImage": "https://example.com/image.jpg",
  "itemName": "Sample Product",
  "brandName": "Sample Brand",
  "productId": "PROD001",
  "productType": "Electronics",
  "productCategory": "64f1a2b3c4d5e6f7g8h9i0j1",
  "modelNo": "MODEL123",
  "manufacturerName": "Sample Manufacturer",
  "productDescription": "This is a sample product",
  "yourPrice": 999.99,
  "maxRetailPrice": 1299.99
}
```

### Create Category
```bash
POST /api/categories
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic products"
}
```

### Create Order
```bash
POST /api/orders
Content-Type: application/json

{
  "customer": "64f1a2b3c4d5e6f7g8h9i0j1",
  "items": [
    {
      "product": "64f1a2b3c4d5e6f7g8h9i0j2",
      "quantity": 2,
      "price": 999.99
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card"
}
```

## 🔒 Security Notes

- In production, implement proper password hashing (bcrypt, etc.)
- Add JWT authentication and authorization middleware
- Implement rate limiting
- Add request validation middleware
- Use HTTPS in production
- Sanitize user inputs

## 📄 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

