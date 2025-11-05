import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

export const getBlogSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const db = getDatabase();
    
    const result = await db.query(
      'SELECT blog_title, blog_description, updated_at, updated_by FROM blog_settings WHERE id = $1',
      [SETTINGS_ID]
    );

    if (result.rows.length === 0) {
      // Create default settings if they don't exist
      await db.query(`
        INSERT INTO blog_settings (id, blog_title, blog_description)
        VALUES ($1, $2, $3)
      `, [SETTINGS_ID, 'My Blog', 'Welcome to my blog']);
      
      const newResult = await db.query(
        'SELECT blog_title, blog_description, updated_at, updated_by FROM blog_settings WHERE id = $1',
        [SETTINGS_ID]
      );
      
      res.json({ settings: newResult.rows[0] });
      return;
    }

    res.json({ settings: result.rows[0] });
  } catch (error) {
    console.error('Error fetching blog settings:', error);
    next(error);
  }
};

export const updateBlogSettings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { blogTitle, blogDescription } = req.body;
    const db = getDatabase();

    // Validate required fields
    if (!blogTitle || blogTitle.trim().length === 0) {
      throw createError('Blog title is required', 400);
    }

    if (blogTitle.length > 200) {
      throw createError('Blog title must be 200 characters or less', 400);
    }

    // Update or insert settings
    const result = await db.query(`
      INSERT INTO blog_settings (id, blog_title, blog_description, updated_by)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) 
      DO UPDATE SET 
        blog_title = EXCLUDED.blog_title,
        blog_description = EXCLUDED.blog_description,
        updated_by = EXCLUDED.updated_by,
        updated_at = CURRENT_TIMESTAMP
      RETURNING blog_title, blog_description, updated_at, updated_by
    `, [
      SETTINGS_ID,
      blogTitle.trim(),
      blogDescription ? blogDescription.trim() : null,
      req.user?.id || null
    ]);

    res.json({
      settings: result.rows[0],
      message: 'Blog settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating blog settings:', error);
    next(error);
  }
};

