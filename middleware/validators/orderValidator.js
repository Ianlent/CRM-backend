import { body, param } from "express-validator";


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
	param("id")
		.notEmpty().withMessage("Order ID is required")
		.isUUID(4).withMessage("Order ID must be a valid UUID v4 string"),

	body("handler_id")
		.optional()
		.isInt({ gt: 0 }).withMessage("Handler ID must be a positive integer"),

	body("discount_id")
		.optional({ nullable: true })
		.isInt({ gt: 0 }).withMessage("Discount ID must be a positive integer if provided"),
	
	body("order_status")
		.optional()
		.isIn(['pending', 'confirmed', 'completed', 'cancelled'])
		.withMessage("Order status must be one of the following: 'pending', 'confirmed', 'completed', 'cancelled'"),

	body("order_date")
		.optional()
		.isISO8601().withMessage("Order date must be a valid date string (ISO 8601)"),
];

export const addServiceToOrderValidation = [
	body("service_id")
		.notEmpty().withMessage("Service ID is required")
		.isInt({ gt: 0 }).withMessage("Service ID must be a positive integer"),

	body("number_of_unit")
		.notEmpty().withMessage("Unit number is required")
		.isInt({ gt: 0 }).withMessage("Unit must be a positive integer"),
];

export const updateServiceInOrderValidation = [
	body("number_of_unit")
		.notEmpty().withMessage("Unit number is required")
		.isInt({ gt: 0 }).withMessage("Unit must be a positive integer"),
];

export const deleteServiceFromOrderValidation = [
	param("service_id")
		.notEmpty().withMessage("Service ID is required")
		.isInt({ gt: 0 }).withMessage("Service ID must be a positive integer"),
];

export const orderParamValidation = [
	param("order_id")
		.notEmpty().withMessage("Order ID is required")
		.isUUID(4).withMessage("Order ID must be a valid UUID v4 string"),
];

export const serviceParamValidation = [
	param("service_id")
		.notEmpty().withMessage("Service ID is required")
		.isInt({ gt: 0 }).withMessage("Service ID must be a positive integer"),
];

export const checkHandlerParamValidation = [
	param("handler_id")
		.notEmpty().withMessage("Handler ID is required")
		.isInt({ gt: 0 }).withMessage("Handler ID must be a positive integer"),
];