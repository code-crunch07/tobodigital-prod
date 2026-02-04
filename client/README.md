# Tobo Digital - Client Frontend

Modern e-commerce client frontend built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🏠 **Homepage** - Beautiful landing page with featured products, new arrivals, and sales
- 🛍️ **Shop Page** - Product listing with filtering and pagination
- 📱 **Responsive Design** - Works seamlessly on all devices
- 🎨 **Modern UI** - Clean and intuitive user interface with Tobo Digital branding
- 🔍 **Search & Filter** - Find products by category, featured, or sale status
- 🛒 **Product Details** - Detailed product pages with image gallery
- 📱 **Mega Menu** - Dynamic shop menu with categories from backend

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running on port 5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. Run the development server:
```bash
npm run dev
```

The client will run on [http://localhost:3001](http://localhost:3001)

## Pages

- `/` - Homepage
- `/shop` - Product listing page
- `/shop?category={id}` - Filtered by category
- `/shop?featured=true` - Featured products
- `/shop?sale=true` - Sale products
- `/new-arrivals` - Latest products
- `/product/[id]` - Product detail page
- `/about` - About Us page
- `/blog` - Blog page
- `/contact` - Contact Us page

## API Integration

The client connects to the backend API at `/api/public` endpoints:

- `GET /api/public/products` - Get products with filters
- `GET /api/public/products/:id` - Get single product
- `GET /api/public/categories` - Get all categories
- `GET /api/public/subcategories` - Get all subcategories
- `GET /api/public/subcategories/category/:categoryId` - Get subcategories by category

## Project Structure

```
client/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Homepage
│   ├── shop/              # Shop pages
│   ├── product/           # Product detail pages
│   ├── new-arrivals/      # New arrivals page
│   ├── about/             # About page
│   ├── blog/              # Blog page
│   ├── contact/           # Contact page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   └── Header.tsx         # Navigation header
└── lib/                   # Utilities
    └── api.ts             # API client
```

## Build for Production

```bash
npm run build
npm start
```

## Technologies

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons
