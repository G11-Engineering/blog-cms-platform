import { Router } from 'express';
import { 
  getMediaFiles, 
  getMediaFileById, 
  uploadMediaFiles, 
  updateMediaFile, 
  deleteMediaFile,
  getMediaThumbnails,
  generateThumbnails,
  serveMediaFile,
  getMediaStats
} from '../controllers/mediaController';
import { authenticateToken, requireAuthor } from '../middleware/auth';
import { upload, handleUploadError } from '../middleware/upload';
import { validateRequest } from '../middleware/validation';
import { updateMediaSchema } from '../schemas/mediaSchemas';

const router = Router();

// Public routes
router.get('/', getMediaFiles);
router.get('/stats', getMediaStats);
router.get('/:id', getMediaFileById);
router.get('/:id/thumbnails', getMediaThumbnails);
router.get('/:id/serve', serveMediaFile);

// Protected routes
router.use(authenticateToken);

router.post('/upload', requireAuthor, upload.array('files', 10), handleUploadError, uploadMediaFiles);
router.put('/:id', requireAuthor, validateRequest(updateMediaSchema), updateMediaFile);
router.delete('/:id', requireAuthor, deleteMediaFile);
router.post('/:id/thumbnails', requireAuthor, generateThumbnails);

export { router as mediaRoutes };
