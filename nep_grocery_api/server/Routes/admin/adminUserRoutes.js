import express from "express";
import { createUser, getUsers, getOneUser, updateOneUser, deleteOneUser, updateUserStatus } from '../../controllers/admin/usermanagement.js';
import {
  authenticateUser, isAdmin
} from "../../middleware/authorizedUser.js";

const router = express.Router();

router.use(authenticateUser, isAdmin);

router.post("/create", createUser);
router.get("/", getUsers);
router.get("/:id", getOneUser);
router.put('/:id', authenticateUser, isAdmin, updateOneUser);
router.put('/:id/status', authenticateUser, isAdmin, updateUserStatus); 
router.delete('/:id', authenticateUser, isAdmin, deleteOneUser); 

export default router;











