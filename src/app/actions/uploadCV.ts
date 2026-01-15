'use server';

import { put } from '@vercel/blob';

/**
 * Server action to upload CV to Vercel Blob
 * @param formData - FormData containing the CV file
 * @param userId - User ID to make filename unique
 * @returns Blob URL or error
 */
export async function uploadCVToBlob(formData: FormData, userId: string) {
    try {
        const file = formData.get('cv') as File;

        if (!file) {
            return { error: 'No file provided' };
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            return { error: 'Invalid file type. Only PDF and Word documents are allowed.' };
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return { error: 'File size exceeds 5MB limit' };
        }

        // Create unique filename with timestamp and userId
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const filename = `cvs/${userId}_${timestamp}.${extension}`;

        // Upload to Vercel Blob
        console.log('🚀 Uploading to Vercel Blob:', filename);
        const blob = await put(filename, file);
        console.log('✅ Blob upload successful:', blob.url);

        return { url: blob.url };
    } catch (error: any) {
        console.error('Blob upload error:', error);
        return { error: error.message || 'Failed to upload CV' };
    }
}
