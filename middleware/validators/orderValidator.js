import { body } from "express-validator";

// Validator for creating a new order
export const createOrderValidation = [
	body("customer_id")
		.notEmpty().withMessage("Customer ID is required")
		.isInt({ gt: 0 }).withMessage("Customer ID must be a positive integer"),

	body("handler_id")
		.notEmpty().withMessage("Handler ID is required")
		.isInt({ gt: 0 }).withMessage("Handler ID must be a positive integer"),

	body("discount_id")
		.optional({ nullable: true })
		.isInt({ gt: 0 }).withMessage("Discount ID must be a positive integer if provided"),

	body("services")
		.isArray({ min: 1 }).withMessage("At least one service must be provided"),

	body("services.*.service_id")
		.notEmpty().withMessage("Service ID is required for each service")
		.isInt({ gt: 0 }).withMessage("Service ID must be a positive integer"),

	body("services.*.number_of_unit")
		.notEmpty().withMessage("Unit number is required for each service")
		.isInt({ gt: 0 }).withMessage("Unit must be a positive integer")
];

// Validator for updating an order (less strict, assumes partial update)
export const updateOrderValidation = [
	body("customer_id")
		.optional()
		.isInt({ gt: 0 }).withMessage("Customer ID must be a positive integer"),

	body("handler_id")
		.optional()
		.isInt({ gt: 0 }).withMessage("Handler ID must be a positive integer"),

	body("discount_id")
		.optional({ nullable: true })
		.isInt({ gt: 0 }).withMessage("Discount ID must be a positive integer if provided"),

	body("services")
		.optional()
		.isArray({ min: 1 }).withMessage("Services must be a non-empty array"),

	body("services.*.service_id")
		.optional()
		.isInt({ gt: 0 }).withMessage("Service ID must be a positive integer"),

	body("services.*.number_of_unit")
		.optional()
		.isInt({ gt: 0 }).withMessage("Unit must be a positive integer"),
	
	body("order_status")
		.optional()
		.isIn(['pending', 'confirmed', 'completed', 'cancelled'])
		.withMessage("Order status must be one of the following: 'pending', 'confirmed', 'completed', 'cancelled'"),

	body("order_date")
		.optional()
		.isISO8601().withMessage("Order date must be a valid date string (ISO 8601)"),
];
