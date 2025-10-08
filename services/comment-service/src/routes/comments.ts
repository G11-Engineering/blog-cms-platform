import { Router } from 'express';
import { 
  getComments, 
  getCommentById, 
  createComment, 
  updateComment, 
  deleteComment,
  moderateComment,
  likeComment,
  getCommentLikes,
  getCommentModeration
} from '../controllers/commentController';
import { authenticateToken, requireEditor } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { 
  createCommentSchema, 
  updateCommentSchema, 
  moderateCommentSchema 
} from '../schemas/commentSchemas';

const router = Router();

// Public routes
router.get('/', getComments);
router.get('/:id', getCommentById);
router.get('/:id/likes', getCommentLikes);
router.post('/:id/like', likeComment);

// Protected routes
router.use(authenticateToken);

router.post('/', validateRequest(createCommentSchema), createComment);
router.put('/:id', validateRequest(updateCommentSchema), updateComment);
router.delete('/:id', deleteComment);
router.post('/:id/moderate', requireEditor, validateRequest(moderateCommentSchema), moderateComment);
router.get('/:id/moderation', requireEditor, getCommentModeration);

export { router as commentRoutes };
