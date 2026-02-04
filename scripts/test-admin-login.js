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
async function testAdminLogin() {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        const admin = await User_1.default.findOne({ email: 'admin@tobo.com' });
        if (!admin) {
            console.log('❌ Admin user not found!');
            console.log('   Run: npm run create-admin');
            process.exit(1);
        }
        console.log('✅ Admin user found:');
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Active: ${admin.isActive}`);
        console.log(`   Name: ${admin.name}`);
        // Test password
        const passwordMatch = await bcrypt_1.default.compare('admin123', admin.password);
        if (passwordMatch) {
            console.log('✅ Password verification: SUCCESS');
        }
        else {
            console.log('❌ Password verification: FAILED');
            console.log('   The password does not match. Updating...');
            const hashedPassword = await bcrypt_1.default.hash('admin123', 10);
            admin.password = hashedPassword;
            await admin.save();
            console.log('✅ Password updated successfully');
        }
        await mongoose_1.default.disconnect();
        console.log('✅ Test completed');
    }
    catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}
testAdminLogin();
//# sourceMappingURL=test-admin-login.js.map