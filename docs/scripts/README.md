# Demo Data Seed Script

This script populates your database with realistic demo data for showcasing the dashboard to clients.

## Usage

```bash
npm run seed:demo
```

## What It Creates

- **4 Categories**: Electronics, Clothing, Home & Kitchen, Books
- **3 SubCategories**: Smartphones, Laptops, Men's Wear
- **6 Products**: Mix of electronics, clothing, and home products with realistic data
- **5 Customers**: Sample customer profiles
- **30 Orders**: Distributed across the last 6 months with various statuses

## Important Notes

⚠️ **Warning**: This script will **DELETE** all existing data before seeding. If you want to keep existing data, modify the script to skip the deletion step.

## Customization

Edit `seed-demo-data.ts` to:
- Change product names, prices, descriptions
- Modify customer information
- Adjust order quantities and dates
- Add more categories/products as needed

