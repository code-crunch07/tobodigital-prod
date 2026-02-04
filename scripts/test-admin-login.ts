import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../src/models/User';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tobo-digital';

async function testAdminLogin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const admin = await User.findOne({ email: 'admin@tobo.com' });
    
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
    const passwordMatch = await bcrypt.compare('admin123', admin.password);
    if (passwordMatch) {
      console.log('✅ Password verification: SUCCESS');
    } else {
      console.log('❌ Password verification: FAILED');
      console.log('   The password does not match. Updating...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin.password = hashedPassword;
      await admin.save();
      console.log('✅ Password updated successfully');
    }

    await mongoose.disconnect();
    console.log('✅ Test completed');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testAdminLogin();

