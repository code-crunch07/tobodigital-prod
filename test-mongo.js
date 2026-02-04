// Quick MongoDB connection test
require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    console.log('📍 Connection string:', process.env.MONGODB_URI?.replace(/\/\/.*:.*@/, '//***:***@'));
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📊 Connection Details:');
    console.log('   - Host:', mongoose.connection.host);
    console.log('   - Database:', mongoose.connection.name);
    console.log('   - Ready State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections in database:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Test query
    const Banner = mongoose.model('Banner', new mongoose.Schema({}, { strict: false }));
    const bannerCount = await Banner.countDocuments();
    console.log(`\n📈 Banner documents: ${bannerCount}`);
    
    await mongoose.connection.close();
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

testConnection();

