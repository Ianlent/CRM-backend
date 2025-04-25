import { body } from 'express-validator';

export const createServiceValidation = [
  body('service_name')
    .exists().withMessage('Service name is required')
    .isString().withMessage('Service name must be a string')
    .isLength({ min: 1, max: 30 }).withMessage('Service name must be 1-30 characters long')
    .trim()
    .escape(),

  body('service_unit')
    .exists().withMessage('Service unit is required')
    .isString().withMessage('Service unit must be a string')
    .isLength({ min: 1, max: 20 }).withMessage('Service unit must be 1-20 characters long')
    .trim()
    .escape(),

  body('service_price_per_unit')
    .exists().withMessage('Price per unit is required')
    .isInt({ gt: 0 }).withMessage('Price per unit must be a positive integer'),
];

export const updateServiceValidation = [
  body('service_name')
    .optional()
    .isString().withMessage('Service name must be a string')
    .isLength({ min: 1, max: 30 }).withMessage('Service name must be 1-30 characters long')
    .trim()
    .escape(),

  body('service_unit')
    .optional()
    .isString().withMessage('Service unit must be a string')
    .isLength({ min: 1, max: 20 }).withMessage('Service unit must be 1-20 characters long')
    .trim()
    .escape(),

  body('service_price_per_unit')
    .optional()
    .isInt({ gt: 0 }).withMessage('Price per unit must be a positive integer'),
];
