const express = require("express");
const { body } = require("express-validator");
const {
  getAllMenuTypes,
  getMenuTypeById,
  createMenuType,
  updateMenuType,
  deleteMenuType,
} = require("../controllers/menuTypeController");

const router = express.Router();

// Validation rules
const menuTypeValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Menu type name is required")
    .isLength({ max: 50 })
    .withMessage("Menu type name cannot exceed 50 characters"),
];

// Routes
router.get("/", getAllMenuTypes);
router.get("/:id", getMenuTypeById);
router.post("/", menuTypeValidation, createMenuType);
router.put("/:id", menuTypeValidation, updateMenuType);
router.delete("/:id", deleteMenuType);

module.exports = router;
