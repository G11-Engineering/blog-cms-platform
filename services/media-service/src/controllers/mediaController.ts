import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { getStorageService } from '../config/storage';

export const getMediaFiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const db = getDatabase();
    const { 
      page = 1, 
      limit = 20, 
      fileType, 
      uploadedBy, 
      search,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    let query = 'SELECT * FROM media_files';
    const conditions: string[] = [];
    const params: any[] = [];
    let paramCount = 0;

    // File type filter
    if (fileType) {
      paramCount++;
      conditions.push(`file_type = $${paramCount}`);
      params.push(fileType);
    }

    // Uploader filter
    if (uploadedBy) {
      paramCount++;
      conditions.push(`uploaded_by = $${paramCount}`);
      params.push(uploadedBy);
    }

    // Search filter
    if (search) {
      paramCount++;
      conditions.push(`(filename ILIKE $${paramCount} OR original_filename ILIKE $${paramCount} OR alt_text ILIKE $${paramCount})`);
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Sorting
    const validSortFields = ['created_at', 'updated_at', 'filename', 'file_size'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'created_at';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${order}`;

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(Number(limit));
    
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM media_files';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = await db.query(countQuery, params.slice(0, -2));

    res.json({
      files: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMediaFileById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const result = await db.query('SELECT * FROM media_files WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      throw createError('Media file not found', 404);
    }

    res.json({ file: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const uploadMediaFiles = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    const { altText, caption, isPublic = true } = req.body;
    const db = getDatabase();
    const storageService = getStorageService();

    if (!files || files.length === 0) {
      throw createError('No files uploaded', 400);
    }

    const uploadedFiles = [];

    for (const file of files) {
      // Determine file type
      let fileType = 'document';
      if (file.mimetype.startsWith('image/')) {
        fileType = 'image';
      } else if (file.mimetype.startsWith('video/')) {
        fileType = 'video';
      } else if (file.mimetype.startsWith('audio/')) {
        fileType = 'audio';
      }

      // Generate unique key for storage
      const fileExtension = path.extname(file.originalname);
      const storageKey = `${uuidv4()}${fileExtension}`;

      // Get image dimensions if it's an image
      let width = null;
      let height = null;
      if (fileType === 'image') {
        try {
          // Use buffer or path depending on storage type
          const imageBuffer = file.buffer || fs.readFileSync(file.path);
          const metadata = await sharp(imageBuffer).metadata();
          width = metadata.width;
          height = metadata.height;
        } catch (error) {
          console.warn('Could not get image metadata:', error);
        }
      }

      // Upload to storage (S3/R2 or local)
      let uploadResult;
      if (file.buffer) {
        // Memory storage (S3/R2)
        uploadResult = await storageService.uploadBuffer(
          file.buffer,
          storageKey,
          file.mimetype,
          {
            originalName: file.originalname,
            uploadedBy: req.user!.id
          }
        );
      } else {
        // Disk storage (local)
        uploadResult = await storageService.uploadFile(
          file.path,
          storageKey,
          file.mimetype,
          {
            originalName: file.originalname,
            uploadedBy: req.user!.id
          }
        );
        // Clean up temp file if using local storage with temp path
        if (file.path && file.path.includes('temp')) {
          try {
            fs.unlinkSync(file.path);
          } catch (err) {
            console.warn('Could not delete temp file:', err);
          }
        }
      }

      // Save to database
      const result = await db.query(`
        INSERT INTO media_files (
          filename, original_filename, file_path, file_url, file_size, mime_type, 
          file_type, width, height, uploaded_by, alt_text, caption, is_public, storage_key
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `, [
        storageKey,
        file.originalname,
        file.path || storageKey,
        uploadResult.url,
        file.size,
        file.mimetype,
        fileType,
        width,
        height,
        req.user!.id,
        altText,
        caption,
        isPublic === 'true',
        uploadResult.key
      ]);

      uploadedFiles.push(result.rows[0]);
    }

    res.status(201).json({ files: uploadedFiles });
  } catch (error) {
    next(error);
  }
};

export const updateMediaFile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { altText, caption, isPublic } = req.body;
    const db = getDatabase();

    // Check if file exists and user has permission
    const existingFile = await db.query('SELECT uploaded_by FROM media_files WHERE id = $1', [id]);
    if (existingFile.rows.length === 0) {
      throw createError('Media file not found', 404);
    }

    if (existingFile.rows[0].uploaded_by !== req.user!.id && !['admin', 'editor'].includes(req.user!.role)) {
      throw createError('Not authorized to update this file', 403);
    }

    const result = await db.query(`
      UPDATE media_files 
      SET alt_text = COALESCE($1, alt_text),
          caption = COALESCE($2, caption),
          is_public = COALESCE($3, is_public),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [altText, caption, isPublic, id]);

    res.json({ file: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const deleteMediaFile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const storageService = getStorageService();

    // Check if file exists and user has permission
    const existingFile = await db.query('SELECT uploaded_by, file_path, storage_key FROM media_files WHERE id = $1', [id]);
    if (existingFile.rows.length === 0) {
      throw createError('Media file not found', 404);
    }

    if (existingFile.rows[0].uploaded_by !== req.user!.id && !['admin', 'editor'].includes(req.user!.role)) {
      throw createError('Not authorized to delete this file', 403);
    }

    // Delete from storage
    const storageKey = existingFile.rows[0].storage_key || existingFile.rows[0].file_path;
    try {
      await storageService.deleteFile(storageKey);
    } catch (error) {
      console.warn('Could not delete file from storage:', error);
    }

    // Delete from database
    await db.query('DELETE FROM media_files WHERE id = $1', [id]);

    res.json({ message: 'Media file deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMediaThumbnails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const result = await db.query(`
      SELECT * FROM media_thumbnails 
      WHERE media_file_id = $1 
      ORDER BY size
    `, [id]);

    res.json({ thumbnails: result.rows });
  } catch (error) {
    next(error);
  }
};

export const generateThumbnails = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const storageService = getStorageService();

    // Get media file
    const fileResult = await db.query('SELECT * FROM media_files WHERE id = $1', [id]);
    if (fileResult.rows.length === 0) {
      throw createError('Media file not found', 404);
    }

    const file = fileResult.rows[0];

    if (file.file_type !== 'image') {
      throw createError('Thumbnails can only be generated for images', 400);
    }

    // Check if user has permission
    if (file.uploaded_by !== req.user!.id && !['admin', 'editor'].includes(req.user!.role)) {
      throw createError('Not authorized to generate thumbnails for this file', 403);
    }

    const thumbnailSizes = [
      { size: 'small', width: 150, height: 150 },
      { size: 'medium', width: 300, height: 300 },
      { size: 'large', width: 600, height: 600 }
    ];

    const generatedThumbnails = [];
    const storageKey = file.storage_key || file.file_path;

    // Get the original image data
    let imageBuffer: Buffer;
    if (storageService.getProvider() === 'local') {
      imageBuffer = fs.readFileSync(file.file_path);
    } else {
      const stream = await storageService.getFileStream(storageKey);
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      imageBuffer = Buffer.concat(chunks);
    }

    for (const { size, width, height } of thumbnailSizes) {
      try {
        // Generate thumbnail buffer
        const thumbnailBuffer = await sharp(imageBuffer)
          .resize(width, height, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();

        // Generate unique key for thumbnail
        const thumbnailKey = `thumbnails/${uuidv4()}_${size}.jpg`;

        // Upload thumbnail to storage
        const uploadResult = await storageService.uploadBuffer(
          thumbnailBuffer,
          thumbnailKey,
          'image/jpeg',
          {
            parentFile: file.id,
            size: size
          }
        );

        // Save thumbnail info to database
        const thumbnailResult = await db.query(`
          INSERT INTO media_thumbnails (media_file_id, thumbnail_path, thumbnail_url, storage_key, width, height, size)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `, [id, thumbnailKey, uploadResult.url, uploadResult.key, width, height, size]);

        generatedThumbnails.push(thumbnailResult.rows[0]);
      } catch (error) {
        console.warn(`Failed to generate ${size} thumbnail:`, error);
      }
    }

    res.json({ thumbnails: generatedThumbnails });
  } catch (error) {
    next(error);
  }
};

// New function to serve media files
export const serveMediaFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const storageService = getStorageService();

    const result = await db.query('SELECT * FROM media_files WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw createError('Media file not found', 404);
    }

    const file = result.rows[0];

    // Check if file is public or user has access
    if (!file.is_public) {
      // In a real implementation, you'd check authentication here
      // For now, we'll allow access to all files
    }

    // If using cloud storage, redirect to CDN URL or signed URL
    if (storageService.getProvider() !== 'local') {
      const storageKey = file.storage_key || file.file_path;
      
      if (file.is_public && file.file_url) {
        // Redirect to public CDN URL
        return res.redirect(file.file_url);
      } else {
        // Generate signed URL for private files
        const signedUrl = await storageService.getSignedUrl(storageKey, 3600); // 1 hour
        return res.redirect(signedUrl);
      }
    }

    // For local storage, serve the file directly
    const filePath = file.file_path;
    
    if (!fs.existsSync(filePath)) {
      throw createError('File not found on disk', 404);
    }

    // Set appropriate headers
    res.setHeader('Content-Type', file.mime_type);
    res.setHeader('Content-Length', file.file_size);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    // Set filename for download
    if (req.query.download === 'true') {
      res.setHeader('Content-Disposition', `attachment; filename="${file.original_filename}"`);
    }

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming file' });
      }
    });
  } catch (error) {
    next(error);
  }
};

// New function to get media statistics
export const getMediaStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const db = getDatabase();

    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_files,
        SUM(file_size) as total_size,
        COUNT(CASE WHEN file_type = 'image' THEN 1 END) as image_count,
        COUNT(CASE WHEN file_type = 'video' THEN 1 END) as video_count,
        COUNT(CASE WHEN file_type = 'audio' THEN 1 END) as audio_count,
        COUNT(CASE WHEN file_type = 'document' THEN 1 END) as document_count
      FROM media_files
    `);

    res.json({ stats: stats.rows[0] });
  } catch (error) {
    next(error);
  }
};
