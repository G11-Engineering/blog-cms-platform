import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

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

      // Get image dimensions if it's an image
      let width = null;
      let height = null;
      if (fileType === 'image') {
        try {
          const metadata = await sharp(file.path).metadata();
          width = metadata.width;
          height = metadata.height;
        } catch (error) {
          console.warn('Could not get image metadata:', error);
        }
      }

      // Save to database
      const result = await db.query(`
        INSERT INTO media_files (
          filename, original_filename, file_path, file_size, mime_type, 
          file_type, width, height, uploaded_by, alt_text, caption, is_public
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        file.filename,
        file.originalname,
        file.path,
        file.size,
        file.mimetype,
        fileType,
        width,
        height,
        req.user!.id,
        altText,
        caption,
        isPublic === 'true'
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

    // Check if file exists and user has permission
    const existingFile = await db.query('SELECT uploaded_by, file_path FROM media_files WHERE id = $1', [id]);
    if (existingFile.rows.length === 0) {
      throw createError('Media file not found', 404);
    }

    if (existingFile.rows[0].uploaded_by !== req.user!.id && !['admin', 'editor'].includes(req.user!.role)) {
      throw createError('Not authorized to delete this file', 403);
    }

    // Delete physical file
    const filePath = existingFile.rows[0].file_path;
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.warn('Could not delete physical file:', error);
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

    for (const { size, width, height } of thumbnailSizes) {
      try {
        const thumbnailFilename = `${uuidv4()}_${size}.jpg`;
        const thumbnailPath = path.join(path.dirname(file.file_path), thumbnailFilename);

        await sharp(file.file_path)
          .resize(width, height, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(thumbnailPath);

        // Save thumbnail info to database
        const thumbnailResult = await db.query(`
          INSERT INTO media_thumbnails (media_file_id, thumbnail_path, width, height, size)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `, [id, thumbnailPath, width, height, size]);

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
