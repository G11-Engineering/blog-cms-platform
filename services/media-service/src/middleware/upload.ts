import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createError } from './errorHandler';
import { getS3Client, getS3Bucket, isS3Configured } from '../config/s3';

// Determine storage type based on configuration
const useS3 = isS3Configured();
const s3Client = useS3 ? getS3Client() : null;
const s3Bucket = getS3Bucket();

// S3 Storage Configuration
const s3Storage = s3Client ? multerS3({
  s3: s3Client,
  bucket: s3Bucket,
  acl: 'public-read', // Make uploaded files publicly accessible
  key: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    const folder = process.env.AWS_S3_FOLDER || 'uploads'; // Optional folder prefix
    cb(null, `${folder}/${uniqueName}`);
  },
  contentType: multerS3.AUTO_CONTENT_TYPE,
}) : null;

// Local Disk Storage Configuration (fallback)
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Use S3 if configured, otherwise fall back to disk storage
const storage = useS3 && s3Storage ? s3Storage : diskStorage;

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(createError('Invalid file type', 400));
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Maximum 10 files per request
  }
});

// Error handler for multer
export const handleUploadError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(createError('File too large', 400));
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return next(createError('Too many files', 400));
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(createError('Unexpected field', 400));
    }
  }
  next(error);
};
