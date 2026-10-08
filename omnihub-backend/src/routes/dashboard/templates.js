import { Router } from 'express';
import { templateController } from '../../controllers/templateController.js';
import { protect } from '../../middleware/auth.js';
import { validateTemplate } from '../../validators/templateValidator.js';

const router = Router();

router.use(protect);

router.get('/', templateController.getAll);
router.get('/:id', templateController.getById);
router.post('/', validateTemplate, templateController.create);
router.put('/:id', validateTemplate, templateController.update);
router.delete('/:id', templateController.delete);

export default router;
