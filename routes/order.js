// routes/ordersRoutes.js
import express from "express";
import { handleValidationErrors } from "../middleware/handleValidationErrors.js";

// Controller functions (create these in orderController.js)
import {
  getAllOrders,
  getOrderDetailsById,
  getOrdersByDateRange,
  createOrder,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
  addServiceToOrder,
  updateOrderService,
  removeServiceFromOrder
} from "../controller/orderController.js";

// Middleware
import authorizeRoles from "../middleware/auth/authorizeRoles.js";
import { createOrderValidation, updateOrderValidation } from "../middleware/validators/orderValidator.js";

const router = express.Router();

//employee routes
// GET
router.get("/", getAllOrders); // ?page=1&limit=10&customer_id=123 (optional filters)
router.get("/:id", getOrderDetailsById);
router.put("/:id/status", updateOrderStatus);

// // POST
router.post("/", createOrderValidation, handleValidationErrors, createOrder);


// Admin or staff only
router.use(authorizeRoles(["admin", "manager"]));
router.get("/search", getOrdersByDateRange); // ?start=2025-04-01&end=2025-04-04
router.put("/:id", updateOrderValidation, handleValidationErrors, updateOrder); // update who handles the order, discount status and track order's status
router.delete("/:id", deleteOrder);

// // Optional service management within orders
// router.post("/:id/services", addServiceToOrder); // add service to order
// router.put("/:id/services/:service_id", updateOrderService); // update quantity
// router.delete("/:id/services/:service_id", removeServiceFromOrder); // remove service

export default router;
