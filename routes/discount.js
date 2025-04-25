import express from 'express';
import {
  createDiscount,
  getAllDiscounts,
  getDiscountById,
  updateDiscountById,
  deleteDiscountById
} from '../controller/discountController.js';

import {
  createDiscountValidation,
  updateDiscountValidation
} from '../middleware/validators/discountValidator.js';

import { handleValidationErrors } from '../middleware/handleValidationErrors.js';

import authorizeRoles from '../middleware/auth/authorizeRoles.js';

const router = express.Router();

router.get('/', getAllDiscounts);
router.get('/:id', getDiscountById);

router.use(authorizeRoles(['admin', 'manager']));
router.post('/', createDiscountValidation, handleValidationErrors, createDiscount);
router.put('/:id', updateDiscountValidation, handleValidationErrors, updateDiscountById);

//admin only routes
router.use(authorizeRoles(['admin']));
router.delete('/:id', deleteDiscountById);

export default router;
