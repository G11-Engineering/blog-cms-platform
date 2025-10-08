import { Router } from 'express';
import { 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  getUserProfile, 
  updateUserProfile,
  changePassword
} from '../controllers/userController';
import { authenticateToken, requireAdmin, requireEditor } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { updateUserSchema, updateProfileSchema, changePasswordSchema } from '../schemas/userSchemas';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// User management routes
router.get('/', requireAdmin, getUsers);
router.get('/profile', getUserProfile);
router.get('/:id', getUserById);
router.put('/profile', validateRequest(updateProfileSchema), updateUserProfile);
router.put('/:id', requireEditor, validateRequest(updateUserSchema), updateUser);
router.delete('/:id', requireAdmin, deleteUser);
router.post('/change-password', validateRequest(changePasswordSchema), changePassword);

export { router as userRoutes };
