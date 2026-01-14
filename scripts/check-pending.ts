// Load environment variables
import { config } from 'dotenv';
config({ path: '.env.local' });

import mongoose from 'mongoose';

async function checkPendingCompanies() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;

        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI not found in .env.local');
        }

        console.log('🔌 Connecting to database...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Define User model inline
        const UserSchema = new mongoose.Schema({
            name: String,
            email: String,
            role: String,
            isApproved: Boolean,
            createdAt: Date,
        });

        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        // Find all pending companies
        console.log('🔍 Looking for pending companies...\n');
        const pendingCompanies = await User.find({
            role: 'company',
            isApproved: false,
        }).select('name email role isApproved createdAt');

        console.log(`Found ${pendingCompanies.length} pending companies:\n`);

        if (pendingCompanies.length === 0) {
            console.log('❌ No pending companies found!');
            console.log('\nChecking all company accounts:');

            const allCompanies = await User.find({ role: 'company' }).select('name email isApproved');
            console.log(`Total companies: ${allCompanies.length}`);
            allCompanies.forEach((company, index) => {
                console.log(`${index + 1}. ${company.email} - Approved: ${company.isApproved}`);
            });
        } else {
            pendingCompanies.forEach((company, index) => {
                console.log(`${index + 1}. Name: ${company.name}`);
                console.log(`   Email: ${company.email}`);
                console.log(`   Created: ${new Date(company.createdAt).toLocaleString()}`);
                console.log(`   Approved: ${company.isApproved}\n`);
            });
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

checkPendingCompanies();
