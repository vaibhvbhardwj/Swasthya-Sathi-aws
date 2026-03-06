const { S3Client, CreateBucketCommand, PutBucketWebsiteCommand, PutBucketPolicyCommand, PutPublicAccessBlockCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Generate a unique bucket name (S3 bucket names must be globally unique)
const BUCKET_NAME = `swasthya-sathi-frontend-${Date.now()}`;

async function setupS3Bucket() {
  try {
    console.log('🚀 Starting S3 bucket setup for frontend hosting...\n');

    // Step 1: Create S3 bucket
    console.log(`📦 Creating S3 bucket: ${BUCKET_NAME}...`);
    try {
      await s3Client.send(new CreateBucketCommand({
        Bucket: BUCKET_NAME
      }));
      console.log('✅ S3 bucket created successfully\n');
    } catch (error) {
      if (error.name === 'BucketAlreadyOwnedByYou') {
        console.log('✅ S3 bucket already exists\n');
      } else {
        throw error;
      }
    }

    // Step 2: Disable Block Public Access settings
    console.log('🔓 Configuring public access settings...');
    await s3Client.send(new PutPublicAccessBlockCommand({
      Bucket: BUCKET_NAME,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false,
        IgnorePublicAcls: false,
        BlockPublicPolicy: false,
        RestrictPublicBuckets: false
      }
    }));
    console.log('✅ Public access settings configured\n');

    // Step 3: Configure static website hosting
    console.log('🌐 Configuring static website hosting...');
    await s3Client.send(new PutBucketWebsiteCommand({
      Bucket: BUCKET_NAME,
      WebsiteConfiguration: {
        IndexDocument: {
          Suffix: 'index.html'
        },
        ErrorDocument: {
          Key: 'index.html' // SPA fallback
        }
      }
    }));
    console.log('✅ Static website hosting enabled with index.html\n');

    // Step 4: Set bucket policy for public read access
    console.log('📜 Setting bucket policy for public read access...');
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
        }
      ]
    };

    await s3Client.send(new PutBucketPolicyCommand({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(bucketPolicy)
    }));
    console.log('✅ Bucket policy set for public read access\n');

    // Step 5: Display results
    console.log('🎉 S3 bucket setup completed successfully!\n');
    console.log('📋 Bucket Details:');
    console.log(`   Bucket Name: ${BUCKET_NAME}`);
    console.log(`   Region: ${process.env.AWS_REGION}`);
    console.log(`   Website URL: http://${BUCKET_NAME}.s3-website-${process.env.AWS_REGION}.amazonaws.com`);
    console.log(`   HTTPS URL: https://${BUCKET_NAME}.s3.amazonaws.com/index.html`);
    console.log('\n📝 Next Steps:');
    console.log('   1. Upload your frontend files to this bucket');
    console.log('   2. Update frontend/config.js with the backend API URL');
    console.log('   3. Access your application via the Website URL above');
    console.log('\n💡 Note: HTTPS is automatically enabled for S3 static websites');
    console.log(`   All content served from S3 uses HTTPS by default\n`);

    // Save bucket name to a config file for later use
    const fs = require('fs');
    const configPath = require('path').join(__dirname, '../config/s3-bucket.json');
    fs.writeFileSync(configPath, JSON.stringify({
      bucketName: BUCKET_NAME,
      region: process.env.AWS_REGION,
      websiteUrl: `http://${BUCKET_NAME}.s3-website-${process.env.AWS_REGION}.amazonaws.com`,
      httpsUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/index.html`,
      createdAt: new Date().toISOString()
    }, null, 2));
    console.log(`✅ Bucket configuration saved to: ${configPath}\n`);

  } catch (error) {
    console.error('❌ Error setting up S3 bucket:', error.message);
    if (error.Code) {
      console.error(`   Error Code: ${error.Code}`);
    }
    process.exit(1);
  }
}

// Run the setup
setupS3Bucket();
