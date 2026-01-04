import express from "express";
import {
  createUser, getUsers, getOneUser, updateOneUser, deleteOneUser
} from "../../controllers/admin/usermanagement.js";
import {
  authenticateUser, isAdmin
} from "../../middleware/authorizedUser.js";

const router = express.Router();

// Apply middleware to ALL routes in this router
router.use(authenticateUser, isAdmin);

router.post("/create", createUser);
router.get("/", getUsers);
router.get("/:id", getOneUser);
router.put("/:id", updateOneUser);
router.delete("/:id", deleteOneUser);

export default router;