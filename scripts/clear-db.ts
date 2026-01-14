// Load environment variables FIRST
import { config } from 'dotenv';
config({ path: '.env.local' });

import mongoose from 'mongoose';

/**
 * Clear Database Script
 * 
 * WARNING: This deletes ALL data except the admin user!
 * Use carefully.
 */

async function clearDatabase() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;

        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI not found in .env.local');
        }

        console.log('🔌 Connecting to database...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Ensure connection is established
        if (!mongoose.connection.db) {
            throw new Error('Database connection not established');
        }

        const collections = await mongoose.connection.db.collections();

        console.log('🗑️  Clearing all data (except admin users)...\n');

        for (const collection of collections) {
            const name = collection.collectionName;

            if (name === 'users') {
                // Only delete non-admin users
                const result = await collection.deleteMany({ role: { $ne: 'admin' } });
                console.log(`   Users (non-admin): ${result.deletedCount} deleted`);
            } else {
                // Delete everything from other collections
                const result = await collection.deleteMany({});
                console.log(`   ${name}: ${result.deletedCount} deleted`);
            }
        }

        console.log('\n✅ Database cleared successfully!');
        console.log('\n📊 What remains:');
        console.log('   - Admin users only');
        console.log('   - All jobs, courses, applications, enrollments deleted');
        console.log('   - All notifications deleted\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing database:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

clearDatabase();
