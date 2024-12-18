import { Router } from 'express';
import { getHomePage, runCode } from '../controllers/codeController.js';

const router = Router();

// Route to render the playground
router.get('/', getHomePage);

// Route to handle code execution
router.post('/run', runCode);

export default router;
