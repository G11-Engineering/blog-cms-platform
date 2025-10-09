import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../config/database';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getComments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const db = getDatabase();
    const { 
      page = 1, 
      limit = 20, 
      postId, 
      parentId, 
      status = 'approved', 
      authorId,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    let query = `
      SELECT c.*, 
             COUNT(cl.id) as like_count,
             CASE WHEN cl_user.id IS NOT NULL THEN true ELSE false END as is_liked
      FROM comments c
      LEFT JOIN comment_likes cl ON c.id = cl.comment_id
      LEFT JOIN comment_likes cl_user ON c.id = cl_user.comment_id AND cl_user.user_id = $1
    `;
    
    const conditions: string[] = [];
    const params: any[] = [req.user?.id || null];
    let paramCount = 1;

    // Post filter
    if (postId) {
      paramCount++;
      conditions.push(`c.post_id = $${paramCount}`);
      params.push(postId);
    }

    // Parent filter
    if (parentId) {
      paramCount++;
      conditions.push(`c.parent_id = $${paramCount}`);
      params.push(parentId);
    } else if (parentId === null || parentId === 'null') {
      conditions.push('c.parent_id IS NULL');
    }

    // Status filter
    if (status) {
      paramCount++;
      conditions.push(`c.status = $${paramCount}`);
      params.push(status);
    }

    // Author filter
    if (authorId) {
      paramCount++;
      conditions.push(`c.author_id = $${paramCount}`);
      params.push(authorId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY c.id';

    // Sorting
    const validSortFields = ['created_at', 'updated_at'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'created_at';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY c.${sortField} ${order}`;

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
    let countQuery = 'SELECT COUNT(*) FROM comments c';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = await db.query(countQuery, params.slice(1, -2));

    res.json({
      comments: result.rows,
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

export const getCommentById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const result = await db.query(`
      SELECT c.*, 
             COUNT(cl.id) as like_count,
             CASE WHEN cl_user.id IS NOT NULL THEN true ELSE false END as is_liked
      FROM comments c
      LEFT JOIN comment_likes cl ON c.id = cl.comment_id
      LEFT JOIN comment_likes cl_user ON c.id = cl_user.comment_id AND cl_user.user_id = $1
      WHERE c.id = $2
      GROUP BY c.id, cl_user.id
    `, [req.user?.id || null, id]);

    if (result.rows.length === 0) {
      throw createError('Comment not found', 404);
    }

    res.json({ comment: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const createComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { postId, content, parentId, authorName, authorEmail, authorWebsite } = req.body;
    const db = getDatabase();

    // Check if post exists (this would typically be done by calling content service)
    // For now, we'll assume the post exists

    const result = await db.query(`
      INSERT INTO comments (
        post_id, author_id, author_name, author_email, author_website, 
        content, parent_id, ip_address, user_agent, is_anonymous
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      postId,
      req.user!.id,
      authorName,
      authorEmail,
      authorWebsite,
      content,
      parentId,
      req.ip,
      req.get('User-Agent'),
      !req.user!.id
    ]);

    res.status(201).json({ comment: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const db = getDatabase();

    // Check if comment exists and user has permission
    const existingComment = await db.query('SELECT author_id FROM comments WHERE id = $1', [id]);
    if (existingComment.rows.length === 0) {
      throw createError('Comment not found', 404);
    }

    if (existingComment.rows[0].author_id !== req.user!.id && !['admin', 'editor'].includes(req.user!.role)) {
      throw createError('Not authorized to update this comment', 403);
    }

    const result = await db.query(`
      UPDATE comments 
      SET content = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [content, id]);

    res.json({ comment: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Check if comment exists and user has permission
    const existingComment = await db.query('SELECT author_id FROM comments WHERE id = $1', [id]);
    if (existingComment.rows.length === 0) {
      throw createError('Comment not found', 404);
    }

    if (existingComment.rows[0].author_id !== req.user!.id && !['admin', 'editor'].includes(req.user!.role)) {
      throw createError('Not authorized to delete this comment', 403);
    }

    await db.query('DELETE FROM comments WHERE id = $1', [id]);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const moderateComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    const db = getDatabase();

    // Check if comment exists
    const existingComment = await db.query('SELECT id FROM comments WHERE id = $1', [id]);
    if (existingComment.rows.length === 0) {
      throw createError('Comment not found', 404);
    }

    // Update comment status
    let status = 'pending';
    if (action === 'approve') {
      status = 'approved';
    } else if (action === 'reject') {
      status = 'rejected';
    } else if (action === 'spam') {
      status = 'spam';
    }

    await db.query(`
      UPDATE comments 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [status, id]);

    // Record moderation action
    await db.query(`
      INSERT INTO comment_moderation (comment_id, moderator_id, action, reason)
      VALUES ($1, $2, $3, $4)
    `, [id, req.user!.id, action, reason]);

    res.json({ message: 'Comment moderated successfully' });
  } catch (error) {
    next(error);
  }
};

export const likeComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Check if comment exists
    const existingComment = await db.query('SELECT id FROM comments WHERE id = $1', [id]);
    if (existingComment.rows.length === 0) {
      throw createError('Comment not found', 404);
    }

    const userId = req.user?.id || null;
    const ipAddress = req.ip;

    // Check if already liked
    const existingLike = await db.query(
      'SELECT id FROM comment_likes WHERE comment_id = $1 AND (user_id = $2 OR ip_address = $3)',
      [id, userId, ipAddress]
    );

    if (existingLike.rows.length > 0) {
      // Unlike
      await db.query(
        'DELETE FROM comment_likes WHERE comment_id = $1 AND (user_id = $2 OR ip_address = $3)',
        [id, userId, ipAddress]
      );
      res.json({ message: 'Comment unliked', liked: false });
    } else {
      // Like
      await db.query(
        'INSERT INTO comment_likes (comment_id, user_id, ip_address) VALUES ($1, $2, $3)',
        [id, userId, ipAddress]
      );
      res.json({ message: 'Comment liked', liked: true });
    }
  } catch (error) {
    next(error);
  }
};

export const getCommentLikes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const result = await db.query(`
      SELECT COUNT(*) as like_count
      FROM comment_likes 
      WHERE comment_id = $1
    `, [id]);

    res.json({ likeCount: parseInt(result.rows[0].like_count) });
  } catch (error) {
    next(error);
  }
};

export const getCommentModeration = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const result = await db.query(`
      SELECT cm.*, u.username as moderator_name
      FROM comment_moderation cm
      LEFT JOIN users u ON cm.moderator_id = u.id
      WHERE cm.comment_id = $1
      ORDER BY cm.created_at DESC
    `, [id]);

    res.json({ moderation: result.rows });
  } catch (error) {
    next(error);
  }
};
