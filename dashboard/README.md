# Tobo Frontend - Admin Dashboard

A modern, responsive admin dashboard for the Tobo E-commerce platform built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State Management**: React Hooks

## 🎨 Features

### Dashboard
- Overview statistics (Total Sales, Orders, Products, Customers)
- Recent orders display
- Revenue analytics

### Products Management
- Complete product listing with search
- Add/Edit/Delete products
- Extensive product form with all fields
- Image support
- Category and subcategory selection
- Stock management
- Pricing information

### Categories Management
- Create and manage categories
- Edit and delete categories
- Automatic slug generation

### Orders Management
- View all orders
- Filter by status (Pending, Processing, Shipped, Delivered, Cancelled)
- Order details display
- Order management actions

### Customers Management
- Customer listing
- View customer theme preferences
- Customer role management
- Active/Inactive status

### Theme Support
- Light/Dark mode toggle
- Persistent theme preference
- Smooth theme transitions

## 🛠️ Installation

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

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
dashboard/
├── app/
│   ├── layout.tsx           # Root layout with sidebar
│   ├── page.tsx             # Dashboard page
│   ├── products/
│   │   └── page.tsx         # Products listing page
│   ├── categories/
│   │   └── page.tsx         # Categories management page
│   ├── orders/
│   │   └── page.tsx         # Orders listing page
│   ├── customers/
│   │   └── page.tsx         # Customers listing page
│   └── globals.css          # Global styles
├── components/
│   ├── ui/                  # Shadcn UI components
│   ├── Sidebar.tsx          # Navigation sidebar
│   ├── ThemeToggle.tsx      # Theme switcher
│   └── ProductForm.tsx      # Product form component
├── lib/
│   ├── api.ts              # API utilities
│   └── utils.ts            # Utility functions
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Features Detail

### Responsive Design
- Mobile-friendly sidebar with hamburger menu
- Responsive tables and cards
- Touch-friendly interface

### Dark Mode
- Smooth theme transitions
- Persistent user preference
- System-aware theme detection

### Data Management
- Real-time data loading
- Error handling
- Loading states
- Optimistic updates

## 🚀 Building for Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API base URL

### API Integration
All API calls are centralized in `lib/api.ts` for easy maintenance and updates.

## 📝 Notes

- The dashboard expects the backend API to be running on `http://localhost:5000`
- All API endpoints follow RESTful conventions
- Authentication is not yet implemented (ready for future integration)
- Image uploads use URLs (consider implementing file upload in production)

## 🎨 Customization

### Colors
Colors can be customized in `app/globals.css` using CSS variables.

### Components
All UI components are from Shadcn UI and can be customized or replaced as needed.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
