# Cloudflare R2 Setup Instructions

This document explains how to configure Cloudflare R2 for video uploads in the Maximum Stock application.

## Overview

The admin upload feature allows the admin user (maxdarling84@gmail.com) to upload videos directly to Cloudflare R2 storage. Videos are stored in R2 and immediately available for users to browse and download.

## Prerequisites

1. Cloudflare account
2. R2 bucket created in Cloudflare
3. Supabase project with the deployed edge function

## Step 1: Create R2 Bucket

1. Log in to your Cloudflare dashboard
2. Navigate to R2 Object Storage
3. Click "Create bucket"
4. Name your bucket (e.g., `maximum-stock-videos`)
5. Select a region close to your users
6. Click "Create bucket"

## Step 2: Enable Public Access

1. Open your R2 bucket
2. Go to Settings
3. Under "Public Access", click "Allow Access"
4. Copy the public bucket URL (e.g., `https://pub-xxxxx.r2.dev`)
5. This URL will be used as `R2_PUBLIC_URL`

## Step 3: Generate R2 API Tokens

1. In Cloudflare dashboard, go to R2
2. Click "Manage R2 API Tokens"
3. Click "Create API Token"
4. Give it a name (e.g., "Maximum Stock Upload")
5. Set permissions:
   - Object Read & Write
6. Select your bucket (or choose "Apply to all buckets")
7. Click "Create API Token"
8. Save the following values:
   - Access Key ID
   - Secret Access Key
   - Account ID (found in the Cloudflare dashboard URL)

## Step 4: Configure Supabase Secrets

The edge function requires these environment variables. Configure them in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to Edge Functions > Secrets
3. Add the following secrets:

```
R2_ACCESS_KEY_ID=<your_access_key_id>
R2_SECRET_ACCESS_KEY=<your_secret_access_key>
R2_BUCKET=<your_bucket_name>
R2_ACCOUNT_ID=<your_cloudflare_account_id>
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

**Important:** Make sure `R2_PUBLIC_URL` does NOT have a trailing slash.

## Step 5: Verify Edge Function Deployment

The edge function `get-r2-upload-url` should already be deployed. To verify:

1. Go to Supabase Dashboard > Edge Functions
2. Confirm `get-r2-upload-url` is listed and deployed
3. Check the function logs for any errors

## Step 6: Test the Upload

1. Sign in as admin (maxdarling84@gmail.com)
2. Click "Admin Upload" in the navigation
3. Upload a test video file
4. Video should upload to R2 and appear in the browse page

## How It Works

### Upload Flow

1. Admin drops/selects a video file on the upload page
2. Frontend calls the Supabase Edge Function to get a presigned R2 URL
3. File is uploaded directly to R2 using the presigned URL
4. After successful upload, metadata is saved to the Supabase database
5. Video is immediately available for users to browse and download

### Tag Extraction

Tags are automatically extracted from the filename:

- Format: `tag1,tag2,tag3.mp4`
- Example: `forest,river,calm.mp4` → tags: ["forest", "river", "calm"]
- Tags can be edited after upload in the success screen

### File Storage

- Videos are stored in R2 at: `videos/<timestamp>-<filename>`
- Public URL format: `https://pub-xxxxx.r2.dev/videos/<timestamp>-<filename>`
- Database stores the public URL for streaming and downloads

## Security Notes

1. Only the admin email (maxdarling84@gmail.com) can access the upload page
2. Admin must be authenticated to upload
3. Database policies ensure only admin can insert/update assets
4. R2 bucket should have CORS configured if needed for direct uploads
5. Presigned URLs expire after 1 hour

## Troubleshooting

### "Failed to get upload URL"
- Check that all R2 environment variables are set correctly in Supabase
- Verify R2 API token has correct permissions
- Check edge function logs for detailed errors

### "Upload failed"
- Ensure R2 bucket allows public access
- Verify presigned URL is not expired
- Check browser console for CORS errors

### Videos not appearing in browse page
- Verify asset was saved to database (check Supabase Table Editor)
- Ensure file_url field is populated
- Check that user has read permissions on assets table

### Download not working
- Verify R2_PUBLIC_URL is correct and accessible
- Check that file exists in R2 bucket
- Ensure public access is enabled on the bucket

## Cost Considerations

Cloudflare R2 pricing (as of 2025):
- Storage: $0.015 per GB/month
- Class A Operations (writes): $4.50 per million requests
- Class B Operations (reads): $0.36 per million requests
- **No egress fees** (major cost savings vs S3)

For a video library with moderate usage, R2 is significantly cheaper than traditional cloud storage due to zero egress costs.
