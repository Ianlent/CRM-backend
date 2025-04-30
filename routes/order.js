// routes/ordersRoutes.js
import express from "express";
import { handleValidationErrors } from "../middleware/handleValidationErrors.js";

// Controller functions (create these in orderController.js)
import {
  getAllOrders,
  getCurrentOrdersForHandler,
  getOrderDetailsById,
  getOrdersByDateRange,
  createOrder,
  updateOrderStatus,
  updateOrderByID,
  deleteOrder,
  addServiceToOrder,
  updateOrderService,
  removeServiceFromOrder
} from "../controller/orderController.js";

// Middleware
import authorizeRoles from "../middleware/auth/authorizeRoles.js";
import {
	createOrderValidation,
	updateOrderValidation,
	addServiceToOrderValidation,
	updateServiceInOrderValidation,
	deleteServiceFromOrderValidation
} from "../middleware/validators/orderValidator.js";
import { checkHandlerParamValidation, orderParamValidation, serviceParamValidation } from "../middleware/validators/orderValidator.js";

const router = express.Router();

//employee routes
// GET
router.get("/:id", getOrderDetailsById);
router.get("/current/:handler_id", checkHandlerParamValidation, handleValidationErrors, getCurrentOrdersForHandler);
router.put("/:id/status", updateOrderValidation, updateOrderStatus);

// // POST
router.post("/", createOrderValidation, handleValidationErrors, createOrder);

// Optional service management within orders
router.post("/:order_id/services", orderParamValidation, addServiceToOrderValidation, handleValidationErrors, addServiceToOrder); // add service to order
router.put("/:order_id/services/:service_id", orderParamValidation, serviceParamValidation, updateServiceInOrderValidation, handleValidationErrors, updateOrderService); // update quantity
router.delete("/:order_id/services/:service_id", orderParamValidation, serviceParamValidation, deleteServiceFromOrderValidation, handleValidationErrors, removeServiceFromOrder); // remove service

// Admin or staff only
router.use(authorizeRoles(["admin", "manager"]));
router.get("/", getAllOrders); // ?page=1&limit=10&customer_id=123 (optional filters)
router.get("/search", getOrdersByDateRange); // ?start=2025-04-01&end=2025-04-04
router.put("/:id", updateOrderValidation, handleValidationErrors, updateOrderByID); // update who handles the order, discount status and track order's status in all cases
router.delete("/:id", deleteOrder);



export default router;
