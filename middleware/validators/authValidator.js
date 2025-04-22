import { body } from "express-validator";

export const registerValidation = [
	body('username')
		.exists().withMessage('Username is required')
		.isLength({ min: 3, max: 32 }).withMessage('Username must be between 3 and 32 characters')
		.trim()
		.escape(),

	body('phone_number')
		.optional()
		.isMobilePhone().withMessage('Invalid phone number')
		.trim()
		.escape(),

	body('password')
		.exists().withMessage('Password is required')
		.isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
		.matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
		.matches(/[0-9]/).withMessage('Password must contain a number'),
];

export const loginValidation = [
	body('username')
		.exists().withMessage('Username is required')
		.trim()
		.escape(),

	body('password')
		.exists().withMessage('Password is required'),
];