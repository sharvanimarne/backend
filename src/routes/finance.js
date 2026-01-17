import express from 'express';
import { 
  getFinances, 
  createFinance, 
  updateFinance, 
  deleteFinance,
  getFinanceSummary
} from '../controllers/financeController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getFinances);
router.post('/', createFinance);
router.get('/summary', getFinanceSummary);
router.put('/:id', updateFinance);
router.delete('/:id', deleteFinance);

export default router;