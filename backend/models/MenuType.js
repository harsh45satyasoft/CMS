const mongoose = require("mongoose");

const menuTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Menu type name is required"],
      unique: true,
      trim: true,
      maxlength: [50, "Menu type name cannot exceed 50 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Create default menu types
menuTypeSchema.statics.createDefaults = function () {
  const defaultTypes = [
    { name: "Top Menu" },
    { name: "Main Menu" },
    { name: "Footer" },
    { name: "Others" },
    { name: "Hidden" },
  ];

  return this.insertMany(defaultTypes, { ordered: false }).catch((err) => {       //insertMany() inserts all of the defaultTypes into the database.
    if (err.code !== 11000) {
      // Ignore duplicate key errors
      console.error("Error creating default menu types:", err);
    }
  });
};

module.exports = mongoose.model("MenuType", menuTypeSchema);

//ordered: false ->Try to insert all documents, even if some fail.Skip only the failed ones (e.g., duplicates).Insert the others successfully.
//Ex. if you want to insert Yop Menu, Main Menu and Footer then Top Menu→Fails(bcoz duplicate)"Main Menu"→Inserted,"Footer"→Inserted