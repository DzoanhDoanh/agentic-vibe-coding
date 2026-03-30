const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

router.route("/").get(protect, listUsers).post(protect, createUser);

router.route("/:id").put(protect, updateUser).delete(protect, deleteUser);

module.exports = router;
