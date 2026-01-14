// Debug script to check draft jobs in database
import { config } from 'dotenv';
config({ path: '.env.local' });

import mongoose from 'mongoose';

async function checkDraftJobs() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;

        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI not found');
        }

        console.log('🔌 Connecting to database...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected\n');

        const JobSchema = new mongoose.Schema({}, { strict: false });
        const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);

        // Find all jobs
        const allJobs = await Job.find({});
        console.log('📊 Total jobs in database:', allJobs.length);

        // Find draft jobs
        const draftJobs = await Job.find({ status: 'draft' });
        console.log('📝 Draft jobs:', draftJobs.length);

        // Find published jobs
        const publishedJobs = await Job.find({ status: 'published' });
        console.log('📢 Published jobs:', publishedJobs.length);

        console.log('\n📋 All Jobs Details:');
        allJobs.forEach((job, index) => {
            console.log(`\n${index + 1}. ${job.title}`);
            console.log('   Status:', job.status);
            console.log('   Company ID:', job.companyId);
            console.log('   Created:', job.createdAt);
        });

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

checkDraftJobs();
