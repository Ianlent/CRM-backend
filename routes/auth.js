import express from "express";
import {login, register} from "../controller/authController.js";
import { registerValidation, loginValidation } from "../middleware/validators/authValidator.js";
import { handleValidationErrors } from "../middleware/handleValidationErrors.js";


const router = express.Router();

router.post("/register", registerValidation, handleValidationErrors, register);

router.post("/login", loginValidation, handleValidationErrors, login);

export default router;