import express from "express";
import { getAllCustomers, getCustomerById, getCustomerByPhoneFirstLast, createCustomer, updateCustomerByID, deleteCustomerByID } from "../controller/customerController.js";
import { createCustomerValidation, updateCustomerValidation } from "../middleware/validators/customerValidator.js";
import { handleValidationErrors } from "../middleware/handleValidationErrors.js";

//auth middleware /////////////////////////////////////////////////////////
import authorizeRoles from '../middleware/auth/authorizeRoles.js';
//////////////////////////////////////////////////////////////////////
const router = express.Router();

//get
router.get("/", getAllCustomers);

router.get("/search", getCustomerByPhoneFirstLast);

router.get("/:id", getCustomerById)

// //post
router.post("/", createCustomerValidation, handleValidationErrors, createCustomer);

// //put
router.put("/:id", updateCustomerValidation, handleValidationErrors, updateCustomerByID);

// //delete
router.delete("/:id", authorizeRoles(['admin']), deleteCustomerByID);

export default router;

