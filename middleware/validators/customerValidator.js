import { body } from "express-validator";

export const createCustomerValidation = [
	body('first_name')
		.exists({ checkFalsy: true }).withMessage('First name is required')
		.isLength({ min: 2, max: 32 }).withMessage('First name must be between 2 and 32 characters')
		.trim()
		.escape(),

	body('last_name')
		.exists({ checkFalsy: true }).withMessage('Last name is required')
		.isLength({ min: 2, max: 32 }).withMessage('Last name must be between 2 and 32 characters')
		.trim()
		.escape(),

	body('phone_number')
		.optional({ nullable: true })
		.isMobilePhone('any', { strictMode: true }).withMessage('Invalid phone number; must be in international E.164 format')
		.trim(),

	body('address')
		.not().isEmpty().withMessage('Address is required')
		.isLength({ min: 5, max: 128 }).withMessage('Address must be between 5 and 128 characters')
		.trim()
		.escape(),

	body('points')
		.optional({ nullable: true })
		.isInt({ min: 0 }).withMessage('Points must be a non-negative integer')
];

export const updateCustomerValidation = [
	body('first_name')
		.optional({ checkFalsy: true })
		.isLength({ min: 2, max: 32 }).withMessage('First name must be between 2 and 32 characters')
		.trim()
		.escape(),

	body('last_name')
		.optional({ checkFalsy: true })
		.isLength({ min: 2, max: 32 }).withMessage('Last name must be between 2 and 32 characters')
		.trim()
		.escape(),

	body('phone_number')
		.optional({ nullable: true })
		.isMobilePhone('any', { strictMode: true }).withMessage('Invalid phone number; must be in international E.164 format')
		.trim(),

	body('address')
		.optional({ checkFalsy: true })
		.isLength({ min: 5, max: 128 }).withMessage('Address must be between 5 and 128 characters')
		.trim()
		.escape(),

	body('points')
		.optional({ nullable: true })
		.isInt({ min: 0 }).withMessage('Points must be a non-negative integer')
];
