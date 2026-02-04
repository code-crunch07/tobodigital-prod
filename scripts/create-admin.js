"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../src/models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tobo-digital';
async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        // Check if admin already exists
        const existingAdmin = await User_1.default.findOne({ email: 'admin@tobo.com' });
        if (existingAdmin) {
            console.log('ℹ️  Admin user already exists');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Role: ${existingAdmin.role}`);
            console.log(`   Active: ${existingAdmin.isActive}`);
            // Update password if needed
            const passwordMatch = await bcrypt_1.default.compare('admin123', existingAdmin.password);
            if (!passwordMatch) {
                console.log('🔄 Updating admin password...');
                const hashedPassword = await bcrypt_1.default.hash('admin123', 10);
                existingAdmin.password = hashedPassword;
                existingAdmin.isActive = true;
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('✅ Admin password updated');
            }
        }
        else {
            // Create admin user
            console.log('📝 Creating admin user...');
            const hashedPassword = await bcrypt_1.default.hash('admin123', 10);
            const admin = new User_1.default({
                name: 'Admin User',
                email: 'admin@tobo.com',
                password: hashedPassword,
                role: 'admin',
                isActive: true,
            });
            await admin.save();
            console.log('✅ Admin user created successfully!');
            console.log('   Email: admin@tobo.com');
            console.log('   Password: admin123');
        }
        await mongoose_1.default.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
    catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}
createAdmin();
//# sourceMappingURL=create-admin.js.map