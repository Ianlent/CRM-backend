import { body } from 'express-validator';

export const validateUser = [
	body('password')
		.exists().withMessage('Password is required')
		.isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
		.matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
		.matches(/[0-9]/).withMessage('Password must contain a number'),

	body('username')
		.trim()
		.notEmpty().withMessage('Username is required')
		.isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
		.escape(),

	body('user_role')
		.isIn(['employee', 'manager', 'admin']).withMessage('Invalid user role'),
	
	
	body('phone_number')
		.optional()
		.isMobilePhone().withMessage('Invalid phone number')
		.trim()
		.escape(),
];