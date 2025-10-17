import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createError } from './errorHandler';

// Configure storage - use memory storage for cloud uploads, disk for local
const getStorage = () => {
  const storageProvider = process.env.STORAGE_PROVIDER || 'local';
  
  if (storageProvider === 'local') {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads');
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });
  } else {
    // Use memory storage for S3/R2 uploads
    return multer.memoryStorage();
  }
};

const storage = getStorage();

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
