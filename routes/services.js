import express from "express";

import { handleValidationErrors } from "../middleware/handleValidationErrors.js";
import {
  getAllServices,
  getServicesByName,
  getServiceById,
  createService,
  updateServiceById,
  deleteServiceById
} from "../controller/serviceController.js";
import {
  createServiceValidation,
  updateServiceValidation
} from "../middleware/validators/serviceValidator.js";

// auth middleware /////////////////////////////////////////////////////////
import authorizeRoles from '../middleware/auth/authorizeRoles.js';
//////////////////////////////////////////////////////////////////////

const router = express.Router();

// GET all services (with optional pagination)
router.get("/", getAllServices); // ?page=1&limit=10

// GET services by name
router.get("/search", getServicesByName); // ?name=abc&page=1&limit=10

// GET a single service by ID
router.get("/:id", getServiceById);


// The following routes require admin privileges
router.use(authorizeRoles(['admin']));

// POST create a new service
router.post(
  "/",
  createServiceValidation,
  handleValidationErrors,
  createService
);

// PUT update a service by ID
router.put(
  "/:id",
  updateServiceValidation,
  handleValidationErrors,
  updateServiceById
);

// DELETE remove (soft-delete) a service by ID
router.delete("/:id", deleteServiceById);

export default router;