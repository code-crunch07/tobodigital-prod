"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = require("crypto");
const dotenv_1 = __importDefault(require("dotenv"));
const Category_1 = __importDefault(require("../src/models/Category"));
const Product_1 = __importDefault(require("../src/models/Product"));
const User_1 = __importDefault(require("../src/models/User"));
const Order_1 = __importDefault(require("../src/models/Order"));
const SubCategory_1 = __importDefault(require("../src/models/SubCategory"));
// Load environment variables
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tobo';
// Demo user password: from env only (never hard-code). Set SEED_DEMO_PASSWORD before running seed.
function getDemoPassword() {
    const pw = process.env.SEED_DEMO_PASSWORD;
    if (pw && pw.length >= 6)
        return pw;
    console.error('❌ Set SEED_DEMO_PASSWORD (min 6 chars) in .env or environment before running seed.');
    process.exit(1);
    throw new Error('SEED_DEMO_PASSWORD required');
}
// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    }
    catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}
// Generate order number (use crypto for S2245, not Math.random)
function generateOrderNumber() {
    return `ORD-${Date.now()}-${crypto_1.randomInt(0, 1000)}`;
}
// Seed demo data
async function seedDemoData() {
    try {
        console.log('🌱 Starting demo data seeding...\n');
        // Clear existing data (optional - comment out if you want to keep existing data)
        console.log('🗑️  Clearing existing data...');
        await Order_1.default.deleteMany({});
        await Product_1.default.deleteMany({});
        await User_1.default.deleteMany({ role: 'customer' });
        await SubCategory_1.default.deleteMany({});
        await Category_1.default.deleteMany({});
        console.log('✅ Existing data cleared\n');
        // Create Categories
        console.log('📁 Creating categories...');
        const electronicsCategory = await Category_1.default.create({
            name: 'Electronics',
            description: 'Electronic products and gadgets',
            slug: 'electronics',
            isActive: true,
        });
        const clothingCategory = await Category_1.default.create({
            name: 'Clothing',
            description: 'Fashion and apparel',
            slug: 'clothing',
            isActive: true,
        });
        const homeCategory = await Category_1.default.create({
            name: 'Home & Kitchen',
            description: 'Home essentials and kitchenware',
            slug: 'home-kitchen',
            isActive: true,
        });
        const booksCategory = await Category_1.default.create({
            name: 'Books',
            description: 'Books and literature',
            slug: 'books',
            isActive: true,
        });
        console.log('✅ Categories created\n');
        // Create SubCategories
        console.log('📂 Creating subcategories...');
        const smartphoneSubCat = await SubCategory_1.default.create({
            name: 'Smartphones',
            category: electronicsCategory._id,
            slug: 'smartphones',
            isActive: true,
        });
        const laptopSubCat = await SubCategory_1.default.create({
            name: 'Laptops',
            category: electronicsCategory._id,
            slug: 'laptops',
            isActive: true,
        });
        const mensWearSubCat = await SubCategory_1.default.create({
            name: 'Men\'s Wear',
            category: clothingCategory._id,
            slug: 'mens-wear',
            isActive: true,
        });
        console.log('✅ Subcategories created\n');
        // Create Products
        console.log('📦 Creating products...');
        const products = [];
        // Electronics products
        products.push(await Product_1.default.create({
            mainImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
            galleryImages: [],
            productType: 'Electronics',
            itemName: 'Premium Smartphone Pro',
            brandName: 'TechBrand',
            productId: 'PROD-001',
            productCategory: electronicsCategory._id,
            subCategory: smartphoneSubCat._id,
            modelNo: 'TB-SP-2024',
            manufacturerName: 'TechBrand Inc.',
            productDescription: 'High-performance smartphone with advanced features and premium design.',
            bulletPoints: ['6.7" OLED Display', '128GB Storage', '48MP Camera', '5G Ready'],
            genericKeyword: ['smartphone', 'mobile', 'phone'],
            specialFeatures: 'Wireless charging, Face ID, Water resistant',
            itemTypeName: 'Smartphone',
            partNumber: 'TB-SP-PRO-001',
            color: 'Midnight Black',
            yourPrice: 49999,
            maxRetailPrice: 59999,
            salePrice: 44999,
            stockQuantity: 50,
            isActive: true,
            itemDimensions: { length: 16, width: 7.5, height: 0.8, unit: 'cm' },
            itemWeight: 200,
            weightUnit: 'grams',
            countryOfOrigin: 'India',
            itemCondition: 'New',
            warrantyDescription: '1 year manufacturer warranty',
        }));
        products.push(await Product_1.default.create({
            mainImage: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
            galleryImages: [],
            productType: 'Electronics',
            itemName: 'Gaming Laptop Ultra',
            brandName: 'GameTech',
            productId: 'PROD-002',
            productCategory: electronicsCategory._id,
            subCategory: laptopSubCat._id,
            modelNo: 'GT-LP-2024',
            manufacturerName: 'GameTech Corp.',
            productDescription: 'Powerful gaming laptop with high-end graphics and fast processor.',
            bulletPoints: ['16" Display', '32GB RAM', '1TB SSD', 'RTX 4070'],
            genericKeyword: ['laptop', 'gaming', 'computer'],
            specialFeatures: 'RGB Keyboard, High refresh rate display',
            itemTypeName: 'Laptop',
            partNumber: 'GT-LP-ULTRA-001',
            color: 'Space Gray',
            yourPrice: 129999,
            maxRetailPrice: 149999,
            salePrice: 119999,
            stockQuantity: 25,
            isActive: true,
            itemDimensions: { length: 36, width: 25, height: 2.5, unit: 'cm' },
            itemWeight: 2200,
            weightUnit: 'grams',
            countryOfOrigin: 'India',
            itemCondition: 'New',
            warrantyDescription: '2 years manufacturer warranty',
        }));
        products.push(await Product_1.default.create({
            mainImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
            galleryImages: [],
            productType: 'Electronics',
            itemName: 'Wireless Headphones Pro',
            brandName: 'SoundMax',
            productId: 'PROD-003',
            productCategory: electronicsCategory._id,
            modelNo: 'SM-HP-2024',
            manufacturerName: 'SoundMax Audio',
            productDescription: 'Premium wireless headphones with noise cancellation.',
            bulletPoints: ['Active Noise Cancellation', '30hr Battery', 'Bluetooth 5.0', 'Comfortable Fit'],
            genericKeyword: ['headphones', 'audio', 'wireless'],
            specialFeatures: 'Quick charge, Voice assistant support',
            itemTypeName: 'Headphones',
            partNumber: 'SM-HP-PRO-001',
            color: 'Black',
            yourPrice: 8999,
            maxRetailPrice: 12999,
            salePrice: 7999,
            stockQuantity: 100,
            isActive: true,
            itemDimensions: { length: 20, width: 18, height: 8, unit: 'cm' },
            itemWeight: 300,
            weightUnit: 'grams',
            countryOfOrigin: 'India',
            itemCondition: 'New',
            warrantyDescription: '1 year warranty',
        }));
        // Clothing products
        products.push(await Product_1.default.create({
            mainImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
            galleryImages: [],
            productType: 'Clothing',
            itemName: 'Classic Cotton T-Shirt',
            brandName: 'FashionLine',
            productId: 'PROD-004',
            productCategory: clothingCategory._id,
            subCategory: mensWearSubCat._id,
            modelNo: 'FL-TS-001',
            manufacturerName: 'FashionLine Apparel',
            productDescription: 'Comfortable and stylish cotton t-shirt for everyday wear.',
            bulletPoints: ['100% Cotton', 'Machine Washable', 'Multiple Colors', 'Comfortable Fit'],
            genericKeyword: ['tshirt', 'clothing', 'apparel'],
            specialFeatures: 'Pre-shrunk, Soft fabric',
            itemTypeName: 'T-Shirt',
            partNumber: 'FL-TS-CLASSIC-001',
            color: 'Navy Blue',
            yourPrice: 799,
            maxRetailPrice: 1299,
            salePrice: 599,
            stockQuantity: 200,
            isActive: true,
            itemDimensions: { length: 30, width: 25, height: 2, unit: 'cm' },
            itemWeight: 150,
            weightUnit: 'grams',
            countryOfOrigin: 'India',
            itemCondition: 'New',
        }));
        products.push(await Product_1.default.create({
            mainImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
            galleryImages: [],
            productType: 'Clothing',
            itemName: 'Denim Jeans Classic',
            brandName: 'FashionLine',
            productId: 'PROD-005',
            productCategory: clothingCategory._id,
            subCategory: mensWearSubCat._id,
            modelNo: 'FL-JN-001',
            manufacturerName: 'FashionLine Apparel',
            productDescription: 'Classic fit denim jeans with premium quality fabric.',
            bulletPoints: ['100% Cotton Denim', 'Classic Fit', 'Durable', 'Stylish Design'],
            genericKeyword: ['jeans', 'denim', 'pants'],
            specialFeatures: 'Stretchable, Fade resistant',
            itemTypeName: 'Jeans',
            partNumber: 'FL-JN-CLASSIC-001',
            color: 'Blue',
            yourPrice: 1999,
            maxRetailPrice: 2999,
            salePrice: 1699,
            stockQuantity: 150,
            isActive: true,
            itemDimensions: { length: 100, width: 40, height: 3, unit: 'cm' },
            itemWeight: 500,
            weightUnit: 'grams',
            countryOfOrigin: 'India',
            itemCondition: 'New',
        }));
        // Home & Kitchen products
        products.push(await Product_1.default.create({
            mainImage: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500',
            galleryImages: [],
            productType: 'Home & Kitchen',
            itemName: 'Stainless Steel Cookware Set',
            brandName: 'HomeEssentials',
            productId: 'PROD-006',
            productCategory: homeCategory._id,
            modelNo: 'HE-CS-001',
            manufacturerName: 'HomeEssentials Inc.',
            productDescription: 'Premium stainless steel cookware set with non-stick coating.',
            bulletPoints: ['10 Piece Set', 'Non-Stick Coating', 'Dishwasher Safe', 'Heat Resistant'],
            genericKeyword: ['cookware', 'kitchen', 'cooking'],
            specialFeatures: 'Induction compatible, Oven safe',
            itemTypeName: 'Cookware',
            partNumber: 'HE-CS-SET-001',
            color: 'Silver',
            yourPrice: 4999,
            maxRetailPrice: 6999,
            salePrice: 4499,
            stockQuantity: 75,
            isActive: true,
            itemDimensions: { length: 40, width: 30, height: 25, unit: 'cm' },
            itemWeight: 3000,
            weightUnit: 'grams',
            countryOfOrigin: 'India',
            itemCondition: 'New',
            warrantyDescription: '5 years warranty',
        }));
        console.log(`✅ Created ${products.length} products\n`);
        // Create Customers (password from env, hashed – never hard-code)
        console.log('👥 Creating customers...');
        const demoPassword = getDemoPassword();
        const hashedPassword = await bcrypt_1.default.hash(demoPassword, 10);
        const customers = [];
        customers.push(await User_1.default.create({
            name: 'Rajesh Kumar',
            email: 'rajesh.kumar@example.com',
            password: hashedPassword,
            role: 'customer',
            theme: 'light',
            isActive: true,
        }));
        customers.push(await User_1.default.create({
            name: 'Priya Sharma',
            email: 'priya.sharma@example.com',
            password: hashedPassword,
            role: 'customer',
            theme: 'dark',
            isActive: true,
        }));
        customers.push(await User_1.default.create({
            name: 'Amit Patel',
            email: 'amit.patel@example.com',
            password: hashedPassword,
            role: 'customer',
            theme: 'light',
            isActive: true,
        }));
        customers.push(await User_1.default.create({
            name: 'Sneha Reddy',
            email: 'sneha.reddy@example.com',
            password: hashedPassword,
            role: 'customer',
            theme: 'dark',
            isActive: true,
        }));
        customers.push(await User_1.default.create({
            name: 'Vikram Singh',
            email: 'vikram.singh@example.com',
            password: hashedPassword,
            role: 'customer',
            theme: 'light',
            isActive: true,
        }));
        console.log(`✅ Created ${customers.length} customers\n`);
        // Create Orders with different dates (last 6 months)
        console.log('📋 Creating orders...');
        const orders = [];
        const now = new Date();
        // Helper to create date N months ago
        const monthsAgo = (months) => {
            const date = new Date(now);
            date.setMonth(date.getMonth() - months);
            return date;
        };
        const statuses = ['pending', 'processing', 'shipped', 'delivered', 'delivered', 'delivered', 'cancelled'];
        const paymentStatuses = ['pending', 'paid', 'paid', 'paid', 'paid', 'paid', 'failed'];
        // Create orders for the last 6 months
        for (let i = 0; i < 30; i++) {
            const monthOffset = Math.floor(i / 5); // Distribute across 6 months
            const dayOffset = i % 30; // Distribute across days
            const orderDate = new Date(monthsAgo(monthOffset));
            orderDate.setDate(orderDate.getDate() - dayOffset);
            const customer = customers[crypto_1.randomInt(0, customers.length)];
            const product = products[crypto_1.randomInt(0, products.length)];
            const quantity = crypto_1.randomInt(1, 4);
            const price = product.yourPrice || product.salePrice || 1000;
            const totalAmount = price * quantity;
            const statusIndex = crypto_1.randomInt(0, statuses.length);
            const status = statuses[statusIndex];
            const paymentStatus = paymentStatuses[statusIndex];
            orders.push(await Order_1.default.create({
                orderNumber: generateOrderNumber(),
                customer: customer._id,
                items: [{
                        product: product._id,
                        quantity: quantity,
                        price: price,
                    }],
                totalAmount: totalAmount,
                status: status,
                shippingAddress: {
                    street: `${crypto_1.randomInt(1, 101)} Main Street`,
                    city: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'][crypto_1.randomInt(0, 5)],
                    state: ['Maharashtra', 'Delhi', 'Karnataka', 'Telangana', 'Tamil Nadu'][crypto_1.randomInt(0, 5)],
                    zipCode: `${crypto_1.randomInt(100000, 1000000)}`,
                    country: 'India',
                },
                paymentMethod: ['credit_card', 'debit_card', 'upi', 'cash_on_delivery'][crypto_1.randomInt(0, 4)],
                paymentStatus: paymentStatus,
                createdAt: orderDate,
                updatedAt: orderDate,
            }));
        }
        console.log(`✅ Created ${orders.length} orders\n`);
        // Summary
        console.log('📊 Demo Data Summary:');
        console.log(`   - Categories: ${await Category_1.default.countDocuments()}`);
        console.log(`   - SubCategories: ${await SubCategory_1.default.countDocuments()}`);
        console.log(`   - Products: ${await Product_1.default.countDocuments()}`);
        console.log(`   - Customers: ${await User_1.default.countDocuments({ role: 'customer' })}`);
        console.log(`   - Orders: ${await Order_1.default.countDocuments()}`);
        console.log('\n✅ Demo data seeding completed successfully!');
        console.log('\n🎉 Your dashboard is now ready for demo!');
        console.log('   Visit: http://localhost:3000\n');
    }
    catch (error) {
        console.error('❌ Error seeding demo data:', error);
        throw error;
    }
}
// Main execution
async function main() {
    await connectDB();
    await seedDemoData();
    await mongoose_1.default.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=seed-demo-data.js.map