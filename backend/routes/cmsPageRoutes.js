const express = require("express");
const { body } = require("express-validator");
const {
  getAllPages,
  getPageById,
  createPage,
  updatePage,
  deletePage,
  togglePageStatus,
  getPagesForDropdown,
  serveFile,
} = require("../controllers/cmsPageController");
const { upload, handleMulterError } = require("../middleware/fileUpload");

const router = express.Router();

// Validation rules
const pageValidation = [
  body("pageTitle")
    .trim()
    .notEmpty()
    .withMessage("Page title is required")
    .isLength({ max: 200 })
    .withMessage("Page title cannot exceed 200 characters"),

  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Slug is required")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),

  body("menuType")
    .notEmpty()
    .withMessage("Menu type is required")
    .isMongoId()
    .withMessage("Invalid menu type ID"),

  body("url")
    .optional()
    .isLength({ max: 500 })
    .withMessage("URL cannot exceed 500 characters"),

  body("windowTitle")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Window title cannot exceed 100 characters"),

  body("metaKeywords")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Meta keywords cannot exceed 500 characters"),

  body("metaDescription")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Meta description cannot exceed 300 characters"),

  body("hasExtURL")
    .optional()
    .isBoolean()
    .withMessage("hasExtURL must be a boolean"),

  body("hasFile")
    .optional()
    .isBoolean()
    .withMessage("hasFile must be a boolean"),
  
  body("openInNewWindow")
    .optional()
    .isBoolean()
    .withMessage("openInNewWindow must be a boolean"),

  body("isEnabled")
    .optional()
    .isBoolean()
    .withMessage("isEnabled must be a boolean"),

  body("orderId")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order ID must be a non-negative integer"),
];

// Routes
router.get("/", getAllPages);
router.get("/dropdown", getPagesForDropdown);
router.get("/file/:id", serveFile); // New route for serving files
router.get("/:id", getPageById);
router.post(
  "/",
  upload.single("file"),
  handleMulterError,
  pageValidation,
  createPage
);
router.put(
  "/:id",
  upload.single("file"),
  handleMulterError,
  pageValidation,
  updatePage
);
router.delete("/:id", deletePage);
router.patch("/:id/toggle-status", togglePageStatus);

module.exports = router;