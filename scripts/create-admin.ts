import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../src/models/User';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tobo-digital';

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@tobo.com' });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Active: ${existingAdmin.isActive}`);
      
      // Update password if needed
      const passwordMatch = await bcrypt.compare('admin123', existingAdmin.password);
      if (!passwordMatch) {
        console.log('🔄 Updating admin password...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        existingAdmin.password = hashedPassword;
        existingAdmin.isActive = true;
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Admin password updated');
      }
    } else {
      // Create admin user
      console.log('📝 Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = new User({
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

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();

