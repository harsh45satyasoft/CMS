const mongoose = require("mongoose");

const cmsPageSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CMSPage",
      default: null,
    },
    pageTitle: {
      type: String,
      required: [true, "Page title is required"],
      trim: true,
      maxlength: [200, "Page title cannot exceed 200 characters"],
    },
    hasExtURL: {
      type: Boolean,
      default: false,
    },
    url: {
      type: String,
      trim: true,
      maxlength: [500, "URL cannot exceed 500 characters"],
    },
    // New fields for file upload
    hasFile: {
      type: Boolean,
      default: false,
    },
    fileName: {
      type: String,
      trim: true,
    },
    originalFileName: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number,
    },
    fileMimeType: {                         //store the MIME type of a file (e.g., "image/png", "application/pdf").
      type: String,
      trim: true,
    },
    filePath: {                             //'uploads/images/pic.jpg' or a cloud URL like 'https://s3.amazonaws.com/...jpg').
      type: String,
      trim: true,
    },
    // End of new fields
    openInNewWindow: {
      type: Boolean,
      default: false,
    },
    content: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9-]+$/,
        "Slug can only contain lowercase letters, numbers, and hyphens",
      ],
    },
    windowTitle: {
      type: String,
      trim: true,
      maxlength: [100, "Window title cannot exceed 100 characters"],
    },
    metaKeywords: {
      type: String,
      trim: true,
      maxlength: [500, "Meta keywords cannot exceed 500 characters"],
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [300, "Meta description cannot exceed 300 characters"],
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    orderId: {
      type: Number,
      default: 0,
    },
    menuType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuType",
      required: [true, "Menu type is required"],
    },
    createdBy: {
      type: String,
      default: "Admin",
    },
    updatedBy: {
      type: String,
      default: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance, Indexes help MongoDB search faster, especially when you're filtering or sorting by a field.
cmsPageSchema.index({ slug: 1 });                       //Speeds up lookups by slug, which is useful when rendering dynamic routes like /about-us.
cmsPageSchema.index({ menuType: 1 });                   //Makes filtering pages by menu type quicker
cmsPageSchema.index({ isEnabled: 1 });                  //Useful when listing only enabled pages
cmsPageSchema.index({ orderId: 1 });                    //Helps in sorting pages by orderId, which is often used for displaying pages in a specific order
 
// Auto-generate slug from pageTitle if not provided
cmsPageSchema.pre("save", function (next) {             //This is a pre-save hook: it runs before saving a document to the database.
  if (!this.slug && this.pageTitle) {
    this.slug = this.pageTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")                     //Remove special characters except spaces and hyphens
      .replace(/\s+/g, "-")                             //Replace spaces with hyphens
      .replace(/-+/g, "-")                              //Replace multiple hyphens with a single hyphen
      .trim("-");                                       //Trim leading(first) and trailing hyphens(last)
  }
  next();
});

// Virtual for file URL
//using a virtual field in Mongoose to dynamically compute a file URL for each CMSPage document, This does not store fileUrl in MongoDB — it just generates it dynamically when needed (like when you return JSON).
cmsPageSchema.virtual("fileUrl").get(function () {     //You're defining a virtual field called fileUrl on the CMSPage schema, This field doesn’t exist in the database, but will behave like a regular property in your API response. & get(function () { ... }) You define a getter for the virtual.The callback function runs every time fileUrl is accessed.
  if (this.hasFile && this.filePath) {                 //Checks if the document has a file associated (hasFile is true) and filePath exists.
    return `/api/cms-pages/file/${this._id}`;          //If those checks pass, return a URL string to download or access the file.Example output: /api/cms-pages/file/64b20d43aabc12345def6789
  }
  return null;                                         //If there’s no file, the virtual returns null.
});

// Ensure virtual fields are serialized
cmsPageSchema.set("toJSON", { virtuals: true });      //By default, Mongoose does not include virtuals when you convert a document to JSON (e.g., res.json(page)).This line tells Mongoose: "Include virtuals when toJSON() is called."(It will include the fileUrl virtual in the JSON output)

module.exports = mongoose.model("CMSPage", cmsPageSchema);