import { S3Client } from '@aws-sdk/client-s3';
import { S3 } from 'aws-sdk';

// S3 Configuration
export const getS3Client = () => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'us-east-1';
  const endpoint = process.env.AWS_S3_ENDPOINT; // Optional: for S3-compatible services like DigitalOcean Spaces

  if (!accessKeyId || !secretAccessKey) {
    console.warn('AWS credentials not configured. Using local storage fallback.');
    return null;
  }

  const s3Config: any = {
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  };

  // For S3-compatible services (like DigitalOcean Spaces, MinIO, etc.)
  if (endpoint) {
    s3Config.endpoint = endpoint;
    s3Config.s3ForcePathStyle = true; // Required for some S3-compatible services
  }

  // Use AWS SDK v2 for better multer-s3 compatibility
  return new S3(s3Config);
};

export const getS3Bucket = (): string => {
  return process.env.AWS_S3_BUCKET || 'blog-cms-media';
};

export const getS3BaseUrl = (): string => {
  const bucket = getS3Bucket();
  const region = process.env.AWS_REGION || 'us-east-1';
  const endpoint = process.env.AWS_S3_ENDPOINT;
  
  // If using custom endpoint (S3-compatible service)
  if (endpoint) {
    return `${endpoint}/${bucket}`;
  }
  
  // Standard S3 URL format
  return `https://${bucket}.s3.${region}.amazonaws.com`;
};

export const isS3Configured = (): boolean => {
  return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
};

