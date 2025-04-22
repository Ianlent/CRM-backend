import express from "express";
const router = express.Router();
import { validateUser } from "../middleware/validators/userValidator.js";
import { handleValidationErrors } from "../middleware/handleValidationErrors.js";
import { getAllUsers, getUserById, createUser, updateUserByID, deleteUserByID } from "../controller/userController.js";

//GET
router.get("/", getAllUsers);

router.get("/:id", getUserById);

//POST
router.post("/", validateUser, handleValidationErrors, createUser);

//PUT
router.put("/:id", validateUser, handleValidationErrors, updateUserByID);

//DELETE
router.delete("/:id", deleteUserByID);

export default router;