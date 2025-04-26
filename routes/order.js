// routes/ordersRoutes.js
import express from "express";
import { handleValidationErrors } from "../middleware/handleValidationErrors.js";

// Controller functions (create these in orderController.js)
import {
  getAllOrders,
  getOrderDetailsById,
  getOrdersByDateRange,
  createOrder,
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

// GET
router.get("/", getAllOrders); // ?page=1&limit=10&customer_id=123 (optional filters)
router.get("/search", getOrdersByDateRange); // ?start=2025-04-01&end=2025-04-04
router.get("/:id", getOrderDetailsById);

// // POST
router.post("/", createOrderValidation, handleValidationErrors, createOrder);

// // Admin or staff only
// router.use(authorizeRoles(["admin", "staff"]));

// router.put("/:id", updateOrderValidation, handleValidationErrors, updateOrder);
// router.delete("/:id", deleteOrder);

// // Optional service management within orders
// router.post("/:id/services", addServiceToOrder); // add service to order
// router.put("/:id/services/:service_id", updateOrderService); // update quantity
// router.delete("/:id/services/:service_id", removeServiceFromOrder); // remove service

export default router;
