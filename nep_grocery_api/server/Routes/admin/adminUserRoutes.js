import express from "express";
import { createUser, getUsers, getOneUser, updateOneUser, deleteOneUser, updateUserStatus } from '../../controllers/admin/usermanagement.js';
import {
  authenticateUser, isAdmin
} from "../../middleware/authorizedUser.js";

const router = express.Router();

// Apply middleware to ALL routes in this router
router.use(authenticateUser, isAdmin);

router.post("/create", createUser);
router.get("/", getUsers);
router.get("/:id", getOneUser);
router.put('/:id', authenticateUser, isAdmin, updateOneUser); // Update user
router.put('/:id/status', authenticateUser, isAdmin, updateUserStatus); // Toggle Ban Status
router.delete('/:id', authenticateUser, isAdmin, deleteOneUser); // Delete usert default router;

export default router;