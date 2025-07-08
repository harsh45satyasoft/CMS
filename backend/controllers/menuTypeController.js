const MenuType = require("../models/MenuType");
const { validationResult } = require("express-validator");

// Get all menu types
const getAllMenuTypes = async (req, res) => {
  try {
    const menuTypes = await MenuType.find().sort({ name: 1 });
    res.json({
      success: true,
      data: menuTypes,
      count: menuTypes.length,                               //Adds the count of items in menuTypes Ex.-> "data": ["Breakfast", "Lunch", "Dinner"] then "count": 3
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching menu types",
      error: error.message,
    });
  }
};

// Get menu type by ID
const getMenuTypeById = async (req, res) => {                  //To fetch a specific Menu Type from the database using its unique ID
  try {
    const menuType = await MenuType.findById(req.params.id);

    if (!menuType) {
      return res.status(404).json({
        success: false,
        message: "Menu type not found",
      });
    }

    res.json({
      success: true,
      data: menuType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching menu type",
      error: error.message,
    });
  }
};

// Create menu type
const createMenuType = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const menuType = new MenuType(req.body);                //Creates a new MenuType instance using the data sent in the request.For example, if the request body is:{ "name": "Top Menu" }It creates a document with that name.
    await menuType.save();

    res.status(201).json({
      success: true,
      message: "Menu type created successfully",
      data: menuType,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Menu type name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating menu type",
      error: error.message,
    });
  }
};

// Update menu type
const updateMenuType = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const menuType = await MenuType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!menuType) {
      return res.status(404).json({
        success: false,
        message: "Menu type not found",
      });
    }

    res.json({
      success: true,
      message: "Menu type updated successfully",
      data: menuType,
    });
  } catch (error) {
    if (error.code === 11000) {                        //This checks if the error is a duplicate key error from MongoDB.Error code 11000 means you're trying to save something with a value that must be unique, like a name that's already in the database.
      return res.status(400).json({
        success: false,
        message: "Menu type name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating menu type",
      error: error.message,
    });
  }
};

// Delete menu type
const deleteMenuType = async (req, res) => {
  try {
    const menuType = await MenuType.findByIdAndDelete(req.params.id);

    if (!menuType) {
      return res.status(404).json({
        success: false,
        message: "Menu type not found",
      });
    }

    res.json({
      success: true,
      message: "Menu type deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting menu type",
      error: error.message,
    });
  }
};

module.exports = {
  getAllMenuTypes,
  getMenuTypeById,
  createMenuType,
  updateMenuType,
  deleteMenuType,
};
